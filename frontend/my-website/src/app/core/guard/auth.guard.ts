import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AuthState } from 'src/app/shared/store/state/auth.state';

import { AuthService } from '../../shared/services/auth.service';
import { GetUserDetailsAction } from '../../shared/store/action/account.action';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private store = inject(Store);
  private router = inject(Router);
  private modal = inject(NgbModal);
  private authService = inject(AuthService);

  access_token$: Observable<String> = inject(Store).select(
    AuthState.accessToken,
  ) as Observable<String>;
  public is_redirect: boolean;

  canActivate(
    _route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Store the attempted URL for redirecting after login
    this.authService.redirectUrl = state.url;

    // Redirect to the login page
    this.access_token$.subscribe(token => {
      if (!token) {
        this.authService.isLogin = true;
        this.is_redirect = false;
      } else {
        this.is_redirect = true;
      }
    });

    this.store.dispatch(new GetUserDetailsAction()).subscribe({
      complete: () => {
        return true;
      },
    });

    return true;
  }

  canActivateChild(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    if (!!this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      if (
        this.router.url.startsWith('/account') ||
        this.router.url == '/checkout' ||
        this.router.url == '/compare'
      )
        void this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
