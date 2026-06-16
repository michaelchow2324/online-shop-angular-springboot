import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICart, ICartAddOrUpdate } from '../../../shared/interface/cart.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { DeleteCartAction, UpdateCartAction } from '../../../shared/store/action/cart.action';
import { CartState } from '../../../shared/store/state/cart.state';

@Component({
  selector: 'app-cart',
  imports: [
    RouterModule,
    CurrencySymbolPipe,
    TranslateModule,
    Breadcrumb,
    Button,
    NoData,
    AsyncPipe,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private store = inject(Store);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);
  cartTotal$: Observable<number> = inject(Store).select(CartState.cartTotal);
  cartDigital$: Observable<boolean | number> = inject(Store).select(
    CartState.cartHasDigital,
  ) as Observable<boolean | number>;

  public breadcrumb: IBreadcrumb = {
    title: 'Cart',
    items: [{ label: 'Cart', active: true }],
  };

  updateQuantity(item: ICart, qty: number) {
    const params: ICartAddOrUpdate = {
      id: item?.id,
      product: item?.product,
      product_id: item?.product?.id,
      variation: item?.variation,
      variation_id: item?.variation_id ? item?.variation_id : null,
      quantity: qty,
    };
    this.store.dispatch(new UpdateCartAction(params));
  }

  delete(id: number) {
    this.store.dispatch(new DeleteCartAction(id));
  }
}
