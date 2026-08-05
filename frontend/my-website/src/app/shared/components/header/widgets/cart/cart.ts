import { AsyncPipe, NgClass } from '@angular/common';
import { Component, HostListener, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICart, ICartAddOrUpdate } from '../../../../interface/cart.interface';
import { IOption } from '../../../../interface/theme-option.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartService } from '../../../../services/cart.service';
import {
  ClearCartAction,
  DeleteCartAction,
  ToggleSidebarCartAction,
  UpdateCartAction,
} from '../../../../store/action/cart.action';
import { CartState } from '../../../../store/state/cart.state';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';
import { Button } from '../../../widgets/button/button';
import { VariationModal } from '../../../widgets/modal/variation-modal/variation-modal';

@Component({
  selector: 'app-cart',
  imports: [CurrencySymbolPipe, TranslateModule, RouterModule, Button, AsyncPipe, NgClass],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  private store = inject(Store);
  cartService = inject(CartService);
  private modal = inject(NgbModal);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);
  cartTotal$: Observable<number> = inject(Store).select(CartState.cartTotal);
  sidebarCartOpen$: Observable<boolean> = inject(Store).select(CartState.sidebarCartOpen);
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  readonly style = input<string>('basic');

  public cartStyle: string = 'cart_sidebar';
  public cart: string;
  public loader: boolean = false;
  public width: number;

  constructor() {
    this.themeOption$.subscribe(option => {
      this.cartStyle = option?.general?.cart_style;
      this.cart = this.cartStyle;
    });
  }

  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;

    if (this.cartStyle == 'cart_mini') {
      if (width <= 767) {
        this.cart = 'cart_sidebar';
      } else if (width > 767) {
        this.cart = 'cart_mini';
      }
    }
  }

  cartToggle(value: boolean) {
    this.store.dispatch(new ToggleSidebarCartAction(value));
  }

  updateQuantity(item: ICart, qty: number) {
    const params: ICartAddOrUpdate = {
      id: item?.id,
      product_id: item?.product?.id,
      product: item?.product ? item?.product : null,
      variation_id: item?.variation_id ? item?.variation_id : null,
      variation: item?.variation ? item?.variation : null,
      quantity: qty,
    };
    this.store.dispatch(new UpdateCartAction(params));
    this.cartService.updateQty();
  }

  delete(id: number) {
    this.store.dispatch(new DeleteCartAction(id));
  }

  clearCart() {
    this.store.dispatch(new ClearCartAction());
  }

  openVariationModal(item: ICart) {
    const modal = this.modal.open(VariationModal, {
      centered: true,
      windowClass: 'theme-modal-2 variation-modal',
    });
    modal.componentInstance.variation = item;
  }
}
