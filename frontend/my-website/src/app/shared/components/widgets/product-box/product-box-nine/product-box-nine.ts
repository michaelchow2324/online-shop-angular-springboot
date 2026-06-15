import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { DisplayVariantAttributes } from '../../display-variant-attributes/display-variant-attributes';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';

@Component({
  selector: 'app-product-box-nine',
  imports: [
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    NgbModule,
    ProductHoverAction,
    DisplayVariantAttributes,
    CartButton,
    DisplayVariantAttributes,
    ProductBoxImageVariant,
    Wishlist,
  ],
  templateUrl: './product-box-nine.html',
  styleUrl: './product-box-nine.scss',
})
export class ProductBoxNine {
  readonly product = input<IProduct>();

  public hoverImage: string;
  public selectedVariation: IVariation;

  constructor() {
    const config = inject(NgbRatingConfig);

    config.max = 5;
    config.readonly = true;
  }

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
      // this.selectedVariant.emit(this.selectedVariation);
    }
  }
}
