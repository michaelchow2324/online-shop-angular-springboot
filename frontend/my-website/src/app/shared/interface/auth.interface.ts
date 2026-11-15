export interface IAuthUserState {
  email: string;
  password: string;
}

/** POST /api/auth/login (and MFA confirm/verify) response */
export interface AuthResponse {
  accessToken: string | null;
  email: string;
  role: string;
  mfaRequired: boolean;
  mfaSetupRequired: boolean;
  mfaToken: string | null;
}

export interface MfaSetupResponse {
  secret: string;
  otpAuthUrl: string;
  email: string;
}

/** GET /api/me, /api/auth/me, register, verify-email response */
export interface MeDTO {
  id: number;
  email: string;
  displayName: string | null;
  phone: string | null;
  countryCode: string | null;
  role: string;
  emailVerifiedAt: string | null;
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
