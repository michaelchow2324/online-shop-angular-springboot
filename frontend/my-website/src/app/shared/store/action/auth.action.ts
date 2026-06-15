import {
  IUpdatePasswordState,
  IAuthForgotPasswordState,
  IAuthUserState,
  IAuthVerifyOTPState,
  IRegisterModal,
  IAuthNumberLoginState,
  IAuthVerifyNumberOTPState,
} from '../../interface/auth.interface';

export class RegisterAction {
  static readonly type = '[Auth] Register';
  constructor(public payload: IRegisterModal) {}
}

export class LoginAction {
  static readonly type = '[Auth] Login';
  constructor(public payload: IAuthUserState) {}
}

export class LoginWithNumberAction {
  static readonly type = '[Auth] Login With Number';
  constructor(public payload: IAuthNumberLoginState) {}
}

export class ForgotPasswordAction {
  static readonly type = '[Auth] ForgotPassword';
  constructor(public payload: IAuthForgotPasswordState) {}
}

export class VerifyOTPAction {
  static readonly type = '[Auth] VerifyOTP';
  constructor(public payload: IAuthVerifyOTPState) {}
}

export class VerifyNumberOTPAction {
  static readonly type = '[Auth] VerifyNumberOTP';
  constructor(public payload: IAuthVerifyNumberOTPState) {}
}

export class UpdatePasswordAction {
  static readonly type = '[Auth] UpdatePassword';
  constructor(public payload: IUpdatePasswordState) {}
}

export class LogoutAction {
  static readonly type = '[Auth] Logout';
}

export class AuthClearAction {
  static readonly type = '[Auth] clear';
}
