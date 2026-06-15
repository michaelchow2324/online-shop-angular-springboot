import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductBoxVariantAttributes } from '../widgets/product-box-variant-attributes/product-box-variant-attributes';

@Component({
  selector: 'app-product-box-horizontal',
  imports: [
    NgbModule,
    CurrencySymbolPipe,
    RouterModule,
    ProductBoxVariantAttributes,
    ProductBoxImageVariant,
    CartButton,
  ],
  templateUrl: './product-box-horizontal.html',
  styleUrl: './product-box-horizontal.scss',
})
export class ProductBoxHorizontal {
  readonly product = input<IProduct>();
  readonly product_box_style = input<string>();

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
