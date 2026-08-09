import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { LoginModal } from '../../../shared/components/widgets/modal/login-modal/login-modal';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { CA_POSTAL_PATTERN, CANADIAN_PROVINCES } from '../../../shared/data/canadian-provinces';
import { CANADA_DIAL_DISPLAY } from '../../../shared/data/country-code';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICart } from '../../../shared/interface/cart.interface';
import {
  CustomerAddress,
  UpsertAddressRequest,
} from '../../../shared/interface/customer-address.interface';
import {
  ApiErrorBody,
  CreateShopOrderRequest,
  ShippingQuote,
  ShopOrderItemRequest,
} from '../../../shared/interface/shop-order.interface';
import { AccountService } from '../../../shared/services/account.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CheckoutService } from '../../../shared/services/checkout.service';
import { ShippingService } from '../../../shared/services/shipping.service';
import { GetAddressesAction, GetUserDetailsAction } from '../../../shared/store/action/account.action';
import { AccountState } from '../../../shared/store/state/account.state';
import { AuthState } from '../../../shared/store/state/auth.state';
import { CartState } from '../../../shared/store/state/cart.state';

@Component({
  selector: 'app-checkout',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    Breadcrumb,
    NoData,
    LoginModal,
    CurrencyPipe,
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);
  private shippingService = inject(ShippingService);
  private checkoutService = inject(CheckoutService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  readonly loginModal = viewChild<LoginModal>('loginModal');

  public breadcrumb: IBreadcrumb = {
    title: 'Check-out',
    items: [{ label: 'Check-out', active: true }],
  };

  public provinces = CANADIAN_PROVINCES;
  public canadaDial = CANADA_DIAL_DISPLAY;
  public form: FormGroup;
  public cartItems: ICart[] = [];
  public cartSubtotal = 0;

  public quote: ShippingQuote | null = null;
  public quoteLoading = false;
  public quoteError: string | null = null;

  public placingOrder = false;
  public placeOrderError: string | null = null;
  public submitted = false;
  /** True when JWT is present — email is forced from the account. */
  public isLoggedIn = false;
  public accountEmail: string | null = null;
  public savedAddresses: CustomerAddress[] = [];
  public selectedAddressId: number | 'new' | null = null;
  /** Guide 09 optional UX — persist shipping address to the account book. */
  public saveAddressToAccount = false;
  public saveAddressAsDefault = true;

  constructor() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      shippingName: ['', [Validators.required, Validators.maxLength(120)]],
      shippingPhone: ['', [Validators.required, Validators.maxLength(40)]],
      shippingLine1: ['', [Validators.required, Validators.maxLength(200)]],
      shippingLine2: ['', [Validators.maxLength(200)]],
      shippingCity: ['', [Validators.required, Validators.maxLength(100)]],
      shippingProvince: ['', [Validators.required]],
      shippingPostal: ['', [Validators.required, Validators.pattern(CA_POSTAL_PATTERN)]],
      // Country is fixed to CA for now — backend rejects non-CA.
      shippingCountry: [{ value: 'CA', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.store
      .select(CartState.cartItems)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(items => {
        this.cartItems = items ?? [];
        this.cartSubtotal = this.store.selectSnapshot(CartState.cartTotal) ?? 0;
      });

    // Prefill / lock email when JWT is present (backend also forces account email).
    this.store
      .select(AuthState.accessToken)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(token => {
        this.isLoggedIn = !!token;
        const email = String(this.store.selectSnapshot(AuthState.email) || '');
        this.accountEmail = email || null;
        if (this.isLoggedIn && email) {
          this.form.patchValue({ email });
          this.form.get('email')?.disable({ emitEvent: false });
          this.store
            .dispatch(new GetUserDetailsAction())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.prefillFromAccountProfile();
                this.loadSavedAddresses();
              },
            });
        } else {
          this.form.get('email')?.enable({ emitEvent: false });
          this.savedAddresses = [];
          this.selectedAddressId = null;
          this.saveAddressToAccount = false;
        }
      });

    // One stream: province OR cart fingerprint changes → debounced quote refresh.
    // Server recomputes subtotal from DB prices; we only send productId + quantity.
    const province$ = this.form.get('shippingProvince')!.valueChanges.pipe(
      startWith(this.form.get('shippingProvince')!.value as string),
    );
    const cartFingerprint$ = this.store.select(CartState.cartItems).pipe(
      map(items =>
        (items ?? [])
          .map(i => `${i.product_id}:${i.quantity}`)
          .join('|'),
      ),
      distinctUntilChanged(),
    );

    combineLatest([province$, cartFingerprint$])
      .pipe(
        debounceTime(300),
        filter(([province]) => !!province && this.cartItems.length > 0),
        tap(() => {
          this.quoteLoading = true;
          this.quoteError = null;
        }),
        switchMap(([province]) =>
          this.shippingService
            .quote({
              shippingProvince: province,
              shippingCountry: 'CA',
              items: this.toItemPayload(),
            })
            .pipe(
              catchError((err: HttpErrorResponse) => {
                this.quote = null;
                this.quoteError = this.readApiMessage(err);
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(quote => {
        this.quoteLoading = false;
        if (quote) {
          this.quote = quote;
        }
      });
  }

  get estimatedTotal(): number {
    if (this.quote?.estimatedTotal != null) {
      return Number(this.quote.estimatedTotal);
    }
    const fee = this.quote?.fee ?? 0;
    const tax = this.quote?.tax ?? 0;
    return this.cartSubtotal + Number(fee) + Number(tax);
  }

  /** Show save checkbox when logged in and entering a new / different address. */
  get showSaveAddressOption(): boolean {
    return this.isLoggedIn && (this.selectedAddressId === 'new' || !this.savedAddresses.length);
  }

  openLogin(): void {
    this.authService.redirectUrl = '/checkout';
    void this.loginModal()?.openModal();
  }

  selectSavedAddress(addressId: number | 'new'): void {
    this.selectedAddressId = addressId;
    if (addressId === 'new') {
      this.saveAddressToAccount = true;
      this.saveAddressAsDefault = this.savedAddresses.length === 0;
      return;
    }
    this.saveAddressToAccount = false;
    const address = this.savedAddresses.find(a => a.id === addressId);
    if (address) {
      this.applyAddressToForm(address);
    }
  }

  placeOrder(): void {
    this.submitted = true;
    this.placeOrderError = null;
    this.form.markAllAsTouched();

    if (this.cartItems.length === 0) {
      this.placeOrderError = 'Your cart is empty.';
      return;
    }

    if (this.form.invalid) {
      this.placeOrderError = 'Please fix the highlighted fields.';
      return;
    }

    if (this.placingOrder) {
      return;
    }

    const raw = this.form.getRawValue();
    const nationalPhone = String(raw.shippingPhone).replace(/\D/g, '');
    const payload: CreateShopOrderRequest = {
      email: String(raw.email).trim(),
      shippingName: String(raw.shippingName).trim(),
      shippingPhone: nationalPhone
        ? `${CANADA_DIAL_DISPLAY} ${nationalPhone}`
        : null,
      shippingLine1: String(raw.shippingLine1).trim(),
      shippingLine2: String(raw.shippingLine2 || '').trim() || null,
      shippingCity: String(raw.shippingCity).trim(),
      shippingProvince: String(raw.shippingProvince).trim().toUpperCase(),
      shippingPostal: this.normalizePostal(String(raw.shippingPostal)),
      shippingCountry: 'CA',
      items: this.toItemPayload(),
    };

    this.placingOrder = true;

    const maybeSave$ =
      this.showSaveAddressOption && this.saveAddressToAccount
        ? this.accountService.createAddress(this.toUpsertAddress(payload)).pipe(
            catchError(() => of(null)), // don't block checkout if address book save fails
          )
        : of(null);

    maybeSave$
      .pipe(switchMap(() => this.checkoutService.createSession(payload)))
      .subscribe({
        next: session => {
          if (isPlatformBrowser(this.platformId) && session.checkoutUrl) {
            window.location.href = session.checkoutUrl;
            return;
          }
          this.placingOrder = false;
          this.placeOrderError = 'Could not start payment. Please try again.';
        },
        error: (err: HttpErrorResponse) => {
          this.placingOrder = false;
          this.placeOrderError = this.readApiMessage(err);
        },
      });
  }

  controlInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!(control && control.invalid && (control.touched || this.submitted));
  }

  isZero(value: number | string | null | undefined): boolean {
    return Number(value ?? 0) === 0;
  }

  private loadSavedAddresses(): void {
    this.store
      .dispatch(new GetAddressesAction())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.savedAddresses = this.store.selectSnapshot(AccountState.addresses) ?? [];
          if (!this.savedAddresses.length) {
            this.selectedAddressId = 'new';
            this.saveAddressToAccount = true;
            this.saveAddressAsDefault = true;
            this.prefillFromAccountProfile();
            return;
          }
          const preferred =
            this.savedAddresses.find(a => a.isDefault) ?? this.savedAddresses[0];
          this.selectedAddressId = preferred.id;
          this.saveAddressToAccount = false;
          this.applyAddressToForm(preferred);
        },
      });
  }

  /**
   * When logged in with no saved address (or "new address"), fill name/phone from profile.
   * Address book values still win when a saved address is selected.
   */
  private prefillFromAccountProfile(): void {
    const user = this.store.selectSnapshot(AccountState.user);
    if (!user) {
      return;
    }
    const patch: { shippingName?: string; shippingPhone?: string } = {};
    const currentName = String(this.form.get('shippingName')?.value ?? '').trim();
    const currentPhone = String(this.form.get('shippingPhone')?.value ?? '').trim();
    const profileName = String(user.name ?? '').trim();
    const profilePhone = String(user.phone ?? '').replace(/\D/g, '');

    if (!currentName && profileName) {
      patch.shippingName = profileName;
    }
    if (!currentPhone && profilePhone) {
      patch.shippingPhone = profilePhone;
    }
    if (Object.keys(patch).length) {
      this.form.patchValue(patch);
    }
  }

  private applyAddressToForm(address: CustomerAddress): void {
    this.form.patchValue({
      shippingName: address.recipientName,
      shippingPhone: String(address.phone ?? '').replace(/\D/g, ''),
      shippingLine1: address.line1,
      shippingLine2: address.line2 ?? '',
      shippingCity: address.city,
      shippingProvince: address.province,
      shippingPostal: address.postal,
    });
  }

  private toUpsertAddress(payload: CreateShopOrderRequest): UpsertAddressRequest {
    return {
      label: 'Home',
      recipientName: payload.shippingName,
      phone: payload.shippingPhone,
      line1: payload.shippingLine1,
      line2: payload.shippingLine2,
      city: payload.shippingCity,
      province: payload.shippingProvince,
      postal: payload.shippingPostal,
      country: 'CA',
      isDefault: this.saveAddressAsDefault || this.savedAddresses.length === 0,
    };
  }

  private toItemPayload(): ShopOrderItemRequest[] {
    return this.cartItems.map(item => ({
      productId: item.product_id ?? item.product?.id,
      quantity: item.quantity,
    }));
  }

  private normalizePostal(postal: string): string {
    const compact = postal.replace(/\s+/g, '').toUpperCase();
    if (compact.length === 6) {
      return `${compact.slice(0, 3)} ${compact.slice(3)}`;
    }
    return postal.trim().toUpperCase();
  }

  private readApiMessage(err: HttpErrorResponse): string {
    const body = err.error as ApiErrorBody | string | null;
    if (body && typeof body === 'object') {
      if (body.fieldErrors?.length) {
        return body.fieldErrors.map(f => f.message).join(' ');
      }
      if (body.message) {
        return body.message;
      }
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (err.status === 0) {
      return 'Cannot reach the store server. Check that the API is running.';
    }
    return err.message || 'Something went wrong. Please try again.';
  }
}
