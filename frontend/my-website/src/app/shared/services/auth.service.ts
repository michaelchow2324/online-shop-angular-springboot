import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";

import { environment } from "../../../environments/environment";
import {
  AuthResponse,
  IAuthUserState,
  MeDTO,
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

  login(payload: IAuthUserState): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email: payload.email.trim(),
      password: payload.password,
    });
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
