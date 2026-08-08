import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { inject, Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { Store } from "@ngxs/store";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { IValues } from "../../shared/interface/setting.interface";
import { AuthService } from "../../shared/services/auth.service";
import { NotificationService } from "../../shared/services/notification.service";
import { AuthClearAction } from "../../shared/store/action/auth.action";
import { SettingState } from "../../shared/store/state/setting.state";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private store = inject(Store);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);

  setting$: Observable<IValues> = inject(Store).select(
    SettingState.setting,
  ) as Observable<IValues>;

  public isMaintenanceModeOn: boolean = false;

  constructor() {
    this.setting$.subscribe((setting) => {
      this.isMaintenanceModeOn = setting?.maintenance?.maintenance_mode!;
    });
  }

  intercept<T>(
    req: HttpRequest<T>,
    next: HttpHandler,
  ): Observable<HttpEvent<T>> {
    // If Maintenance Mode On
    if (this.isMaintenanceModeOn) {
      this.ngZone.run(() => {
        void this.router.navigate(["/maintenance"]);
      });
      // End the interceptor chain if in maintenance mode
    }

    // Fall back to persisted auth when Ngxs has not rehydrated yet (guards / early HTTP).
    const token = this.authService.resolveAccessToken(
      this.store.selectSnapshot((state) => state.auth?.access_token),
    );
    if (token && !req.headers.has("Authorization")) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only clear session when a Bearer token was actually rejected — not when we
        // forgot to attach one (that used to wipe a valid ADMIN login during /admin guard).
        if (error.status === 401 && req.headers.has("Authorization")) {
          this.notificationService.notification = false;
          this.store.dispatch(new AuthClearAction());
        }
        return throwError(() => error);
      }),
    );
  }
}
