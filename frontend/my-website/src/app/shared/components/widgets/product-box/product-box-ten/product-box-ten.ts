import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';

@Component({
  selector: 'app-product-box-ten',
  imports: [
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    NgbModule,
    ProductHoverAction,
    CartButton,
    ProductBoxImageVariant,
    Wishlist,
    NgClass,
  ],
  templateUrl: './product-box-ten.html',
  styleUrl: './product-box-ten.scss',
})
export class ProductBoxTen {
  readonly product = input<IProduct>();
}
