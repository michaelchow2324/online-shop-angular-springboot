import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { Store } from "@ngxs/store";
import { catchError, map, of } from "rxjs";

import { AuthService } from "../../shared/services/auth.service";
import { NotificationService } from "../../shared/services/notification.service";
import { AuthState } from "../../shared/store/state/auth.state";
import { roleFromJwt } from "../../shared/utils/jwt-role";
import { readPersistedAuth } from "../../shared/utils/persisted-auth";

/**
 * Protects /admin/* — requires ADMIN (guide 07).
 *
 * JWT lives in browser localStorage, so SSR has no session. Never redirect to `/`
 * on the server (that was sending admins home on every full page load).
 * {@link AdminOrders} re-checks after hydration via afterNextRender.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const store = inject(Store);
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  authService.redirectUrl = state.url;

  // Server render: allow the route shell; client enforces ADMIN after hydration.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const persisted = readPersistedAuth();
  const token = String(
    store.selectSnapshot(AuthState.accessToken) ||
      persisted?.access_token ||
      "",
  ).trim();
  const role = String(
    store.selectSnapshot(AuthState.role) ||
      persisted?.role ||
      roleFromJwt(token) ||
      "",
  )
    .trim()
    .toUpperCase();

  if (!token) {
    authService.isLogin = true;
    return router.createUrlTree(["/"]);
  }

  if (role === "ADMIN") {
    return true;
  }

  return authService.meWithToken(token).pipe(
    map((me) => {
      const meRole = (me.role || "").toUpperCase();
      if (meRole === "ADMIN") {
        return true;
      }
      notification.showError(
        "Admin access requires an ADMIN account. Log out and sign in as admin.",
      );
      return router.createUrlTree(["/"]);
    }),
    catchError(() => {
      if (roleFromJwt(token) === "ADMIN") {
        return of(true);
      }
      authService.isLogin = true;
      return of(router.createUrlTree(["/"]));
    }),
  );
};

/** Shared browser check used by the admin page after SSR hydration. */
export function hasAdminSession(store: Store): boolean {
  const persisted = readPersistedAuth();
  const token = String(
    store.selectSnapshot(AuthState.accessToken) ||
      persisted?.access_token ||
      "",
  ).trim();
  if (!token) {
    return false;
  }
  const role = String(
    store.selectSnapshot(AuthState.role) ||
      persisted?.role ||
      roleFromJwt(token) ||
      "",
  )
    .trim()
    .toUpperCase();
  return role === "ADMIN";
}
