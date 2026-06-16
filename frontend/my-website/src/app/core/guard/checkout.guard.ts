import { Injectable, ViewChild, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AuthService } from './../../shared/services/auth.service';
import { GetUserDetailsAction } from './../../shared/store/action/account.action';
import { LoginModal } from '../../shared/components/widgets/modal/login-modal/login-modal';

@Injectable({
  providedIn: 'root',
})
export class CheckoutGuard {
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);

  @ViewChild('loginModal') LoginModal: LoginModal;

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Store the attempted URL for redirecting after login
    this.authService.redirectUrl = state.url;

    if (this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      this.store.dispatch(new GetUserDetailsAction()).subscribe({
        complete: () => {
          return true;
        },
      });
    } else {
      // .setting.activation.guest_checkout
      if (this.store.selectSnapshot(state => state.setting)) {
        // Redirect to the login page
        if (this.store.selectSnapshot(state => state.cart.is_digital_only)) {
          void this.LoginModal.openModal();
          return true;
        }
      } else {
        void this.LoginModal.openModal();
        return true;
      }
    }

    return true;
  }
}
