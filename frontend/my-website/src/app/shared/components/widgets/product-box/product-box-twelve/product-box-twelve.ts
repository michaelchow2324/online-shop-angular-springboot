import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductBoxVariantAttributes } from '../widgets/product-box-variant-attributes/product-box-variant-attributes';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

@Component({
  selector: 'app-product-box-twelve',
  imports: [
    RouterModule,
    NgbModule,
    CurrencySymbolPipe,
    ProductHoverAction,
    TranslateModule,
    ProductBoxVariantAttributes,
    ProductBoxImageVariant,
    CartButton,
  ],
  templateUrl: './product-box-twelve.html',
  styleUrl: './product-box-twelve.scss',
})
export class ProductBoxTwelve {
  readonly product = input<IProduct>();

  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
  }
}
