import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import {
  AuthResponse,
  IAuthUserState,
  MeDTO,
  MfaSetupResponse,
} from "../interface/auth.interface";
import { readPersistedAuth } from "../utils/persisted-auth";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);

  /** After login, navigate here (e.g. /checkout or /account/order). */
  public redirectUrl: string | undefined;
  public confirmed: boolean = false;
  /** Layout watches this to open the login modal when AuthGuard blocks. */
  public isLogin: boolean = false;
  /** Last email used on login — Alert uses this for "Resend verification". */
  public lastLoginEmail: string | null = null;
  /** Short-lived MFA session token between password OK and TOTP OK. */
  public pendingMfaToken: string | null = null;
  /** Set after ADMIN password login when authenticator enrollment is required. */
  public pendingMfaSetup = false;
  /** Set after ADMIN password login when an authenticator code is required. */
  public pendingMfaChallenge = false;

  login(payload: IAuthUserState): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email: payload.email.trim(),
      password: payload.password,
    });
  }

  startMfaSetup(mfaToken: string): Observable<MfaSetupResponse> {
    return this.http.post<MfaSetupResponse>(
      `${environment.apiUrl}/auth/mfa/setup/start`,
      { mfaToken },
    );
  }

  confirmMfaSetup(mfaToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/mfa/setup/confirm`,
      { mfaToken, code },
    );
  }

  verifyMfa(mfaToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/mfa/verify`,
      { mfaToken, code },
    );
  }

  register(payload: {
    email: string;
    password: string;
    phone: string;
    countryCode: string;
  }): Observable<MeDTO> {
    return this.http.post<MeDTO>(`${environment.apiUrl}/auth/register`, {
      email: payload.email.trim(),
      password: payload.password,
      phone: String(payload.phone).trim(),
      countryCode: String(payload.countryCode).trim(),
    });
  }

  me(): Observable<MeDTO> {
    return this.http.get<MeDTO>(`${environment.apiUrl}/auth/me`);
  }

  /** Like {@link me} but always sends Bearer — safe when Ngxs store token is empty. */
  meWithToken(token: string): Observable<MeDTO> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<MeDTO>(`${environment.apiUrl}/auth/me`, { headers });
  }

  /** Best-effort token for interceptors when the store slice is not ready yet. */
  resolveAccessToken(storeToken: string | null | undefined): string | null {
    if (storeToken) {
      return String(storeToken);
    }
    const persisted = readPersistedAuth()?.access_token;
    return persisted ? String(persisted) : null;
  }

  verifyEmail(token: string): Observable<MeDTO> {
    return this.http.post<MeDTO>(
      `${environment.apiUrl}/auth/verify-email`,
      null,
      {
        params: { token },
      },
    );
  }

  /** Public; always returns a generic success message (no email enumeration). */
  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/resend-verification`,
      { email: email.trim() },
    );
  }
}
