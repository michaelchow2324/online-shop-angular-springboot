import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, TemplateRef, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { ForgotPassword } from '../../../../../components/auth/forgot-password/forgot-password';
import { Login } from '../../../../../components/auth/login/login';
import { LoginWithNumber } from '../../../../../components/auth/login-with-number/login-with-number';
import { Otp } from '../../../../../components/auth/otp/otp';
import { Register } from '../../../../../components/auth/register/register';
import { UpdatePassword } from '../../../../../components/auth/update-password/update-password';
import { ICart, ICartAddOrUpdate } from '../../../../interface/cart.interface';
import { IValues } from '../../../../interface/setting.interface';
import { IOption } from '../../../../interface/theme-option.interface';
import { AuthService } from '../../../../services/auth.service';
import { LoginAction } from '../../../../store/action/auth.action';
import { GetCartItemsAction, SyncCartAction } from '../../../../store/action/cart.action';
import { CartState } from '../../../../store/state/cart.state';
import { SettingState } from '../../../../store/state/setting.state';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';

@Component({
  selector: 'app-login-modal',
  imports: [
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    Login,
    ForgotPassword,
    Otp,
    UpdatePassword,
    Register,
    LoginWithNumber,
  ],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  private modalService = inject(NgbModal);
  private store = inject(Store);
  private authService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  private router = inject(Router);

  readonly LoginModal = viewChild<TemplateRef<string>>('loginModal');

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  themeOption$: Observable<IOption> = inject(Store).select(ThemeOptionState.themeOptions);

  public validate: boolean = false;
  public loginForm: FormGroup;
  public closeResult: string;
  public modalOpen: boolean = false;
  public activeForm: string = 'login';
  public storageURL = environment.storageURL;
  public themeOption: IOption;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);

    this.themeOption$.subscribe(res => (this.themeOption = res));

    this.loginForm = this.formBuilder.group({
      email: new FormControl('john.customer@example.com', [Validators.required, Validators.email]),
      password: new FormControl('123456789', Validators.required),
    });
  }

  ngAfterViewInit(): void {
    if (this.authService.isLogin === true) {
      void this.openModal();
    }
  }

  submit() {
    this.validate = true;
    if (this.loginForm.valid) {
      this.store.dispatch(new LoginAction(this.loginForm.value)).subscribe({
        complete: () => {
          // Sync Cart Storage when successfully Login
          let syncCartItems: ICartAddOrUpdate[] = [];
          this.cartItem$.subscribe(items => {
            items.filter(item => {
              if (item) {
                const params: ICartAddOrUpdate = {
                  id: null,
                  product: item?.product,
                  product_id: item?.product_id,
                  variation: item?.variation ? item.variation : null,
                  variation_id: item?.variation_id ? item.variation_id : null,
                  quantity: item.quantity,
                };
                syncCartItems.push(params);
              }
            });
          });
          if (syncCartItems.length) {
            this.store.dispatch(new SyncCartAction(syncCartItems));
          } else {
            this.store.dispatch(new GetCartItemsAction());
          }

          // Navigate to the intended URL after successful login
          const redirectUrl = this.authService.redirectUrl || '/account/dashboard';
          if (redirectUrl) {
            void this.router.navigateByUrl(redirectUrl);
          }

          // Clear the stored redirect URL
          this.authService.redirectUrl = undefined;
        },
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  nextForm(action: string) {
    this.activeForm = action;
  }

  async openModal() {
    if (this.isBrowser) {
      this.modalOpen = true;
      this.modalService
        .open(this.LoginModal(), {
          ariaLabelledBy: 'Login-Modal',
          centered: true,
          windowClass: 'modal-xl modal-dialog-centered auth-modal',
        })
        .result.then(
          result => {
            `Result ${result}`;
          },
          reason => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          },
        );
    }
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    this.authService.isLogin = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
