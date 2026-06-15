export interface IAuthUserState {
  email: string;
  password: string;
}

export interface IAuthStateModal {
  email: string;
  token: String | Number;
  access_token: String | null;
  permissions: [];
}

export interface IAuthForgotPasswordState {
  email: string;
}

export interface IAuthNumberLoginState {
  phone: number;
  country_code: number;
}

export interface IAuthVerifyOTPState {
  email: string;
  token: string;
}

export interface IAuthVerifyNumberOTPState {
  phone: number;
  country_code: number;
  token: string;
}

export interface IUpdatePasswordState {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface IRegisterModal {
  name: string;
  email: string;
  phone: number;
  country_code: number;
  password: string;
  password_confirmation: string;
}
