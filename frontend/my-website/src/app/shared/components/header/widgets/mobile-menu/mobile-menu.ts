import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { AuthService } from '../../../../services/auth.service';
import { ToggleSidebarCartAction } from '../../../../store/action/cart.action';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterModule, TranslateModule],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class IMobileMenu {
  private store = inject(Store);
  private authService = inject(AuthService);
  private router = inject(Router);

  public active: string = '/';

  cartToggle(value: boolean) {
    this.store.dispatch(new ToggleSidebarCartAction(value));
  }

  activeMenu(menu: string) {
    this.active = menu;
  }

  reDirectWishlist() {
    if (!this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      this.authService.isLogin = true;
    } else {
      void this.router.navigate(['/wishlist']);
      this.activeMenu('wishlist');
    }
  }
}
