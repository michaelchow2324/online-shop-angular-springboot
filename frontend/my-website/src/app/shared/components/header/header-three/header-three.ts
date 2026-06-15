import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICategory, ICategoryModel } from '../../../interface/category.interface';
import { IOption } from '../../../interface/theme-option.interface';
import { MenuService } from '../../../services/menu.service';
import { GetHeaderCategoriesAction } from '../../../store/action/category.action';
import { CategoryState } from '../../../store/state/category.state';
import { Menu } from '../../widgets/menu/menu';
import { TopBar } from '../../widgets/top-bar/top-bar';
import { Cart } from '../widgets/cart/cart';
import { HeaderLogo } from '../widgets/header-logo/header-logo';
import { Search } from '../widgets/search/search';
import { UserProfile } from '../widgets/user-profile/user-profile';

@Component({
  selector: 'app-header-three',
  imports: [
    TranslateModule,
    RouterModule,
    TopBar,
    HeaderLogo,
    Menu,
    Search,
    Cart,
    UserProfile,
    NgClass,
  ],
  templateUrl: './header-three.html',
  styleUrl: './header-three.scss',
})
export class HeaderThree {
  private store = inject(Store);
  private menuService = inject(MenuService);

  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.headerCategory);

  readonly data = input<IOption | null>();
  readonly logo = input<string | null>();
  readonly class = input<string>();
  readonly sticky = input<boolean | number>(); // Default false

  public stick: boolean = false;
  public categories: ICategory[];
  public activeCategory: number;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const categoryIds = this.data()?.header.category_ids;

    // Get Category
    this.store.dispatch(
      new GetHeaderCategoriesAction({
        status: 1,
        ids: categoryIds?.join(','),
      }),
    );

    if (categoryIds && categoryIds.length) {
      this.category$.subscribe(res => {
        if (res) {
          this.categories = res.data.filter(category => categoryIds?.includes(category.id));

          if (this.categories.length) {
            this.activeCategory = this.categories[0].id;
          }
        }
      });
    }
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
}
