import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { DisplayVariantAttributes } from '../../display-variant-attributes/display-variant-attributes';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';

@Component({
  selector: 'app-product-box-five',
  imports: [
    CurrencySymbolPipe,
    RouterModule,
    TranslateModule,
    ProductHoverAction,
    DisplayVariantAttributes,
    Wishlist,
    CartButton,
    ProductBoxImageVariant,
    NgbRating,
  ],
  templateUrl: './product-box-five.html',
  styleUrl: './product-box-five.scss',
})
export class ProductBoxFive {
  readonly product = input<IProduct>();

  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
      // this.selectedVariant.emit(this.selectedVariation);
    }
  }
}
