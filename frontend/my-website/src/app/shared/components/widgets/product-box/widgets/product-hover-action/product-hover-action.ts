import { Component, input } from '@angular/core';

import { Compare } from './compare/compare';
import { QuickView } from './quick-view/quick-view';
import { Wishlist } from './wishlist/wishlist';
import { IProduct } from '../../../../../interface/product.interface';

@Component({
  selector: 'app-product-hover-action',
  imports: [Wishlist, QuickView, Compare],
  templateUrl: './product-hover-action.html',
  styleUrl: './product-hover-action.scss',
})
export class ProductHoverAction {
  readonly product = input<IProduct>();
  readonly showAction = input<string[]>(['view', 'wishlist', 'compare']);
  readonly class = input<string>();
}
