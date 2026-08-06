import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AuthService } from '../../shared/services/auth.service';
import { GetUserDetailsAction } from '../../shared/store/action/account.action';
import { AuthState } from '../../shared/store/state/auth.state';

/**
 * Protects /account/* (and wishlist/compare).
 * No JWT → open login modal and block navigation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.authService.redirectUrl = state.url;

    const token = this.store.selectSnapshot(AuthState.accessToken);
    if (!token) {
      this.authService.isLogin = true; // layout opens login modal
      return false;
    }

    this.store.dispatch(new GetUserDetailsAction());
    return true;
  }

  canActivateChild(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    // Multikart leftover for auth pages — unused for our modal-based login.
    return true;
  }
}
