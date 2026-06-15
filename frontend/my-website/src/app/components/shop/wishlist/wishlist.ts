import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IProduct } from 'src/app/shared/interface/product.interface';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Loader } from '../../../shared/components/widgets/loader/loader';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { ProductCartButton } from '../../../shared/components/widgets/product-box/widgets/product-cart-button/product-cart-button';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { IWishlistModel } from '../../../shared/interface/wishlist.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { WishlistService } from '../../../shared/services/wishlist.service';
import {
  DeleteWishlistAction,
  GetWishlistAction,
} from '../../../shared/store/action/wishlist.action';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';
import { WishlistState } from '../../../shared/store/state/wishlist.state';

@Component({
  selector: 'app-wishlist',
  imports: [
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    Breadcrumb,
    NoData,
    ProductCartButton,
    Loader,
  ],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {
  private store = inject(Store);
  wishlistService = inject(WishlistService);

  wishlistItems$: Observable<IWishlistModel> = inject(Store).select(WishlistState.wishlistItems);
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public wishlistItems: IProduct[];

  public breadcrumb: IBreadcrumb = {
    title: 'Wishlist',
    items: [{ label: 'Wishlist', active: true }],
  };

  public skeletonItems = Array.from({ length: 12 }, (_, index) => index);

  ngOnInit() {
    this.store.dispatch(new GetWishlistAction());

    this.wishlistItems$.subscribe(items => {
      if (items) {
        this.wishlistItems = items.data;
      }
    });
  }

  removeWishlist(id: number) {
    this.store.dispatch(new DeleteWishlistAction(id));
  }
}
