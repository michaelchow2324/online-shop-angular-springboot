import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { QuickView } from '../widgets/product-hover-action/quick-view/quick-view';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';

@Component({
  selector: 'app-product-box-eight',
  imports: [
    NgbModule,
    RouterModule,
    TranslateModule,
    CurrencySymbolPipe,
    QuickView,
    Wishlist,
    CartButton,
    ProductBoxImageVariant,
  ],
  templateUrl: './product-box-eight.html',
  styleUrl: './product-box-eight.scss',
})
export class ProductBoxEight {
  readonly product = input<IProduct>();
}
