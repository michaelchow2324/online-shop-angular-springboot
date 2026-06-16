import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import {
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../../../../store/action/wishlist.action';
import { DisplayVariantAttributes } from '../../display-variant-attributes/display-variant-attributes';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { Compare } from '../widgets/product-hover-action/compare/compare';
import { QuickView } from '../widgets/product-hover-action/quick-view/quick-view';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';

@Component({
  selector: 'app-product-box-three',
  imports: [
    CurrencySymbolPipe,
    RouterModule,
    NgbRating,
    NgbModule,
    QuickView,
    DisplayVariantAttributes,
    CartButton,
    Compare,
    ProductBoxImageVariant,
    Wishlist,
  ],
  templateUrl: './product-box-three.html',
  styleUrl: './product-box-three.scss',
})
export class ProductBoxThree {
  private store = inject(Store);

  readonly product = input<IProduct>();

  public hoverImage: string;
  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
  }

  ariaValueText(current: number, max: number) {
    return `${current} out of ${max} hearts`;
  }

  addToWishlist(product: IProduct) {
    if (this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      product['is_wishlist'] = !product['is_wishlist'];
    }
    let action =
      product['is_wishlist'] ===
      !!this.store.selectSnapshot(state => state.auth && state.auth.access_token)
        ? new AddToWishlistAction({ product_id: product.id })
        : new DeleteWishlistAction(product.id);
    if (action) {
      this.store.dispatch(action);
    }
  }
}
