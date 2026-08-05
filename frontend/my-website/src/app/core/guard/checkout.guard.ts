import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { CartState } from '../../shared/store/state/cart.state';

/**
 * Guest checkout is allowed (guide 04 / 05). We only require a non-empty cart.
 * Auth is optional — "Log in" on the checkout page is UI-only until JWT lands.
 */
@Injectable({
  providedIn: 'root',
})
export class CheckoutGuard {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const items = this.store.selectSnapshot(CartState.cartItems) ?? [];
    if (!items.length) {
      return this.router.createUrlTree(['/cart']);
    }
    return true;
  }
}
