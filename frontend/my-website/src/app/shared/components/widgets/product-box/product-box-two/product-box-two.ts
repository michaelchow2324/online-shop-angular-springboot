import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
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
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

export interface result {
  value: IVariation;
  label: string;
}
@Component({
  selector: 'app-product-box-two',
  imports: [
    NgbModule,
    CurrencySymbolPipe,
    RouterModule,
    ProductHoverAction,
    TranslateModule,
    CartButton,
    ProductHoverAction,
    ProductBoxImageVariant,
    DisplayVariantAttributes,
    NgClass,
  ],
  templateUrl: './product-box-two.html',
  styleUrl: './product-box-two.scss',
})
export class ProductBoxTwo {
  private store = inject(Store);

  readonly product = input<IProduct>();

  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
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
