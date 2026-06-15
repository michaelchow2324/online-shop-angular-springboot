import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { SaleTimer } from '../../sale-timer/sale-timer';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

@Component({
  selector: 'app-product-box-six',
  imports: [
    RouterModule,
    CurrencySymbolPipe,
    NgbModule,
    ProductHoverAction,
    CartButton,
    SaleTimer,
    ProductBoxImageVariant,
    TranslateModule,
  ],
  templateUrl: './product-box-six.html',
  styleUrl: './product-box-six.scss',
})
export class ProductBoxSix {
  readonly product = input<IProduct>();

  public selectedVariation: IVariation;

  selectedVariant(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
      // this.selectedVariant.emit(this.selectedVariation);
    }
  }
}
