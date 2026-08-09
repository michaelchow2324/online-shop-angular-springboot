import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs';

import { IAuthNumberLoginState } from '../../interface/auth.interface';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { roleFromJwt } from '../../utils/jwt-role';
import { AccountClearAction, GetUserDetailsAction } from '../action/account.action';
import {
  AuthClearAction,
  ForgotPasswordAction,
  LoginAction,
  LoginWithNumberAction,
  LogoutAction,
  RegisterAction,
  UpdatePasswordAction,
  VerifyNumberOTPAction,
  VerifyOTPAction,
} from '../action/auth.action';

export interface AuthStateModel {
  email: String;
  number: IAuthNumberLoginState | null;
  token: String | Number;
  access_token: String | null;
  role: string | null;
  permissions: [];
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    email: '',
    token: '',
    number: null,
    access_token: '',
    role: null,
    permissions: [],
  },
})
@Injectable()
export class AuthState {
  private store = inject(Store);
  router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  @Selector()
  static accessToken(state: AuthStateModel): String | null {
    return state.access_token;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): Boolean {
    return !!state.access_token;
  }

  @Selector()
  static email(state: AuthStateModel): String {
    return state.email;
  }

  @Selector()
  static role(state: AuthStateModel): string | null {
    return state.role;
  }

  @Selector()
  static number(state: AuthStateModel): IAuthNumberLoginState | null {
    return state.number;
  }

  @Selector()
  static token(state: AuthStateModel): String | Number {
    return state.token;
  }

  @Action(RegisterAction)
  register(_ctx: StateContext<AuthStateModel>, action: RegisterAction) {
    const payload = action.payload as {
      email: string;
      password: string;
      phone: string | number;
      country_code: string | number;
    };
    return this.authService
      .register({
        email: payload.email,
        password: payload.password,
        phone: String(payload.phone ?? ''),
        countryCode: String(payload.country_code ?? ''),
      })
      .pipe(
        tap({
          next: () => {
            this.notificationService.showSuccess(
              'Account created. Check your email to verify your address.',
            );
          },
          error: err => {
            throw new Error(err?.error?.message || 'Registration failed');
          },
        }),
      );
  }

  @Action(LoginAction)
  login(ctx: StateContext<AuthStateModel>, action: LoginAction) {
    // JWT is persisted via NgxsStoragePlugin (keys includes 'auth') → localStorage.
    // AuthInterceptor reads access_token and sets Authorization: Bearer …
    // Post-login navigation is handled by the login modal (avoid double navigate).
    this.authService.lastLoginEmail = String(action.payload?.email ?? '').trim() || null;
    return this.authService.login(action.payload).pipe(
      tap({
        next: res => {
          const role =
            (res.role || roleFromJwt(res.accessToken) || '').toString().toUpperCase() || null;
          ctx.patchState({
            email: res.email,
            token: '',
            access_token: res.accessToken,
            role,
          });
          // Drop previous account cache (e.g. USER) before loading the new session
          this.store.dispatch(new AccountClearAction());
          this.store.dispatch(new GetUserDetailsAction());
        },
        error: err => {
          throw new Error(err?.error?.message || 'Invalid email or password');
        },
      }),
    );
  }

  @Action(LoginWithNumberAction)
  loginWithNumber(_ctx: StateContext<AuthStateModel>, _action: LoginWithNumberAction) {
    // Not supported by Spring API (email/password only).
  }

  @Action(ForgotPasswordAction)
  forgotPassword(_ctx: StateContext<AuthStateModel>, _action: ForgotPasswordAction) {
    // Forgot Password Logic Here
  }

  @Action(VerifyOTPAction)
  verifyEmail(_ctx: StateContext<AuthStateModel>, _action: VerifyOTPAction) {
    // Theme OTP flow — real verify uses /api/auth/verify-email?token=
  }

  @Action(VerifyNumberOTPAction)
  verifyNumber(_ctx: StateContext<AuthStateModel>, _action: VerifyNumberOTPAction) {
    // Verify Logic Here
  }

  @Action(UpdatePasswordAction)
  updatePassword(_ctx: StateContext<AuthStateModel>, _action: UpdatePasswordAction) {
    // Update Password Logic Here
  }

  @Action(LogoutAction)
  logout(_ctx: StateContext<AuthStateModel>) {
    this.store.dispatch(new AuthClearAction());
    void this.router.navigate(['/']);
  }

  @Action(AuthClearAction)
  authClear(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({
      email: '',
      token: '',
      access_token: null,
      role: null,
      permissions: [],
    });
    this.authService.redirectUrl = undefined;
    this.store.dispatch(new AccountClearAction());
    // Do not clear cart on logout — guest cart should survive.
  }
}
