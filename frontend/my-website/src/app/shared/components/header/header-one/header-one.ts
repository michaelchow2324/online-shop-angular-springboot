import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, HostListener, PLATFORM_ID, inject, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';

import { IOption } from '../../../interface/theme-option.interface';
import { AuthService } from '../../../services/auth.service';
import { MenuService } from '../../../services/menu.service';
import { Menu } from '../../widgets/menu/menu';
import { TopBar } from '../../widgets/top-bar/top-bar';
import { Cart } from '../widgets/cart/cart';
import { HeaderLogo } from '../widgets/header-logo/header-logo';
import { Search } from '../widgets/search/search';
import { UserProfile } from '../widgets/user-profile/user-profile';

@Component({
  selector: 'app-header-one',
  imports: [RouterModule, HeaderLogo, TopBar, Menu, Cart, Search, UserProfile, NgClass],
  templateUrl: './header-one.html',
  styleUrl: './header-one.scss',
})
export class HeaderOne {
  private menuService = inject(MenuService);
  private router = inject(Router);
  private store = inject(Store);
  private authService = inject(AuthService);

  readonly data = input<IOption | null>();
  readonly logo = input<string | null>();
  readonly class = input<string>();
  readonly sticky = input<boolean | number>(); // Default false

  public stick: boolean = false;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
  }
  // @HostListener Decorator
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isBrowser) {
      let number =
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (number >= 50 && window.innerWidth > 400) {
        this.stick = true;
      } else {
        this.stick = false;
      }
    }
  }

  mainMenuOpen() {
    this.menuService.mainMenuToggle = true;
  }

  reDirectWishlist() {
    if (!this.store.selectSnapshot(state => state.auth && state.auth.access_token))
      this.authService.isLogin = true;
    else void this.router.navigate(['/wishlist']);
  }
}
