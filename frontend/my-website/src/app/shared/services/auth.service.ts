import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, IAuthUserState, MeDTO } from '../interface/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  /** After login, navigate here (e.g. /checkout or /account/order). */
  public redirectUrl: string | undefined;
  public confirmed: boolean = false;
  /** Layout watches this to open the login modal when AuthGuard blocks. */
  public isLogin: boolean = false;

  login(payload: IAuthUserState): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email: payload.email.trim(),
      password: payload.password,
    });
  }

  register(payload: { email: string; password: string }): Observable<MeDTO> {
    return this.http.post<MeDTO>(`${environment.apiUrl}/auth/register`, {
      email: payload.email.trim(),
      password: payload.password,
    });
  }

  me(): Observable<MeDTO> {
    return this.http.get<MeDTO>(`${environment.apiUrl}/auth/me`);
  }

  verifyEmail(token: string): Observable<MeDTO> {
    return this.http.post<MeDTO>(`${environment.apiUrl}/auth/verify-email`, null, {
      params: { token },
    });
  }
}
