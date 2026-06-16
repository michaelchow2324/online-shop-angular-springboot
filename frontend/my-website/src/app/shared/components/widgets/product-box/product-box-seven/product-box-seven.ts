import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

@Component({
  selector: 'app-product-box-seven',
  imports: [
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    NgbModule,
    ProductHoverAction,
    CartButton,
    ProductBoxImageVariant,
  ],
  templateUrl: './product-box-seven.html',
  styleUrl: './product-box-seven.scss',
})
export class ProductBoxSeven {
  readonly product = input<IProduct>();
}
