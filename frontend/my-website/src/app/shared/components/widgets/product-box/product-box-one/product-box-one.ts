import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductBoxVariantAttributes } from '../widgets/product-box-variant-attributes/product-box-variant-attributes';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

@Component({
  selector: 'app-product-box-one',
  imports: [
    NgbModule,
    RouterModule,
    TranslateModule,
    CurrencySymbolPipe,
    ProductHoverAction,
    ProductBoxVariantAttributes,
    CartButton,
    ProductHoverAction,
    ProductBoxImageVariant,
  ],
  templateUrl: './product-box-one.html',
  styleUrl: './product-box-one.scss',
})
export class ProductBoxOne {
  readonly product = input<IProduct>();

  public selectedVariation: IVariation;

  constructor() {
    const config = inject(NgbRatingConfig);

    config.max = 5;
    config.readonly = true;
  }

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
  }
}
