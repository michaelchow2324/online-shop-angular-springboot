import { Component, inject, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Alert } from '../../../shared/components/widgets/alert/alert';
import { Button } from '../../../shared/components/widgets/button/button';
import { AuthResponse } from '../../../shared/interface/auth.interface';
import { ICart, ICartAddOrUpdate } from '../../../shared/interface/cart.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import {
  ApplyAuthSessionAction,
  LoginAction,
} from '../../../shared/store/action/auth.action';
import { GetCartItemsAction, SyncCartAction } from '../../../shared/store/action/cart.action';
import { AuthState } from '../../../shared/store/state/auth.state';
import { CartState } from '../../../shared/store/state/cart.state';

type LoginStep = 'credentials' | 'mfa-setup' | 'mfa-verify';

@Component({
  selector: 'app-login',
  imports: [RouterModule, FormsModule, ReactiveFormsModule, TranslateModule, Alert, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private store = inject(Store);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  formBuilder = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private router = inject(Router);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems) as Observable<ICart[]>;

  readonly activeForm = output<string>();

  public validate = false;
  public loginForm: FormGroup;
  public mfaForm: FormGroup;
  public step: LoginStep = 'credentials';
  public mfaSecret: string | null = null;
  public otpAuthUrl: string | null = null;
  public mfaBusy = false;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
    this.mfaForm = this.formBuilder.group({
      code: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{6}$/),
      ]),
    });
  }

  submit() {
    this.validate = true;
    if (!this.loginForm.valid) {
      return;
    }

    this.store.dispatch(new LoginAction(this.loginForm.value)).subscribe({
      next: () => {
        if (this.store.selectSnapshot(AuthState.accessToken)) {
          this.finishLoggedIn();
          return;
        }
        if (this.authService.pendingMfaSetup && this.authService.pendingMfaToken) {
          this.startMfaEnrollment(this.authService.pendingMfaToken);
          return;
        }
        if (this.authService.pendingMfaChallenge && this.authService.pendingMfaToken) {
          this.step = 'mfa-verify';
          this.mfaForm.reset();
          this.validate = false;
        }
      },
    });
  }

  submitMfa() {
    this.validate = true;
    if (!this.mfaForm.valid || !this.authService.pendingMfaToken) {
      return;
    }

    const code = String(this.mfaForm.value.code).trim();
    const mfaToken = this.authService.pendingMfaToken;
    this.mfaBusy = true;

    const request$ =
      this.step === 'mfa-setup'
        ? this.authService.confirmMfaSetup(mfaToken, code)
        : this.authService.verifyMfa(mfaToken, code);

    request$.subscribe({
      next: (res: AuthResponse) => {
        this.mfaBusy = false;
        if (!res.accessToken) {
          this.notificationService.showError('Could not complete sign-in. Try again.');
          return;
        }
        this.store
          .dispatch(
            new ApplyAuthSessionAction({
              accessToken: res.accessToken,
              email: res.email,
              role: res.role,
            }),
          )
          .subscribe({
            complete: () => this.finishLoggedIn(),
          });
      },
      error: err => {
        this.mfaBusy = false;
        this.notificationService.showError(
          err?.error?.message || 'Invalid authenticator code',
        );
      },
    });
  }

  backToCredentials() {
    this.step = 'credentials';
    this.mfaSecret = null;
    this.otpAuthUrl = null;
    this.authService.pendingMfaToken = null;
    this.authService.pendingMfaSetup = false;
    this.authService.pendingMfaChallenge = false;
    this.mfaForm.reset();
    this.validate = false;
  }

  copySecret() {
    if (!this.mfaSecret || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    void navigator.clipboard.writeText(this.mfaSecret);
    this.notificationService.showSuccess('Secret copied');
  }

  action(action: string) {
    this.activeForm.emit(action);
  }

  private startMfaEnrollment(mfaToken: string) {
    this.mfaBusy = true;
    this.authService.startMfaSetup(mfaToken).subscribe({
      next: setup => {
        this.mfaBusy = false;
        this.step = 'mfa-setup';
        this.mfaSecret = setup.secret;
        this.otpAuthUrl = setup.otpAuthUrl;
        this.mfaForm.reset();
        this.validate = false;
      },
      error: err => {
        this.mfaBusy = false;
        this.notificationService.showError(
          err?.error?.message || 'Could not start MFA setup',
        );
        this.backToCredentials();
      },
    });
  }

  private finishLoggedIn() {
    this.modalService.dismissAll();

    let syncCartItems: ICartAddOrUpdate[] = [];
    this.cartItem$.subscribe(items => {
      items.filter(item => {
        if (item) {
          syncCartItems.push({
            id: null,
            product: item?.product,
            product_id: item?.product_id,
            variation: item?.variation ? item.variation : null,
            variation_id: item?.variation_id ? item.variation_id : null,
            quantity: item.quantity,
          });
        }
      });
    });
    if (syncCartItems.length) {
      this.store.dispatch(new SyncCartAction(syncCartItems));
    } else {
      this.store.dispatch(new GetCartItemsAction());
    }

    const redirectUrl = this.authService.redirectUrl;
    this.authService.redirectUrl = undefined;
    this.authService.isLogin = false;

    const role = (this.store.selectSnapshot(AuthState.role) || '').toString().toUpperCase();
    const wantsAdmin = !!redirectUrl?.startsWith('/admin');
    if (role === 'ADMIN') {
      void this.router.navigateByUrl(redirectUrl || '/admin/orders');
    } else if (wantsAdmin) {
      this.notificationService.showError(
        'That account is not ADMIN. Sign in with the seeded admin user.',
      );
      void this.router.navigateByUrl('/account/dashboard');
    } else if (redirectUrl) {
      void this.router.navigateByUrl(redirectUrl);
    }
  }
}
