import { Component, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';

import { IProduct } from '../../../../../../interface/product.interface';
import {
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../../../../../../store/action/wishlist.action';

@Component({
  selector: 'app-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss',
})
export class Wishlist {
  private store = inject(Store);

  readonly product = input<IProduct>();
  readonly class = input<string>('');

  addToWishlist(product: IProduct) {
    if (this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      product['is_wishlist'] = !product['is_wishlist'];
    }
    let action =
      product['is_wishlist'] ===
      !!this.store.selectSnapshot(state => state.auth && state.auth.access_token)
        ? new AddToWishlistAction({ product_id: product.id })
        : new DeleteWishlistAction(product.id);
    if (action) {
      this.store.dispatch(action);
    }
  }
}
