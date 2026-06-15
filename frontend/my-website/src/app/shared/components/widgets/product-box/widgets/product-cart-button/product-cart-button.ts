import { Component, inject, input } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICart, ICartAddOrUpdate } from '../../../../../interface/cart.interface';
import { IProduct } from '../../../../../interface/product.interface';
import { AddToCartAction } from '../../../../../store/action/cart.action';
import { CartState } from '../../../../../store/state/cart.state';

@Component({
  selector: 'app-product-cart-button',
  imports: [TranslateModule],
  templateUrl: './product-cart-button.html',
  styleUrl: './product-cart-button.scss',
})
export class ProductCartButton {
  private store = inject(Store);
  private modal = inject(NgbModal);

  readonly product = input<IProduct>();
  readonly type = input<string>();

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);

  public cartItem: ICart | null;

  ngOnInit() {
    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => item.product.id == this.product()?.id)!;
    });
  }

  openModal(_product: IProduct) {
    // const modal = this.modal.open(ProductDetailsModal, { centered: true, size: 'lg', windowClass: 'theme-modal-2'});
    // modal.componentInstance.product = product;
  }

  addToCart(product: IProduct, qty: number) {
    const params: ICartAddOrUpdate = {
      id: this.cartItem ? this.cartItem.id : null,
      product: product,
      product_id: product?.id,
      variation_id: this.cartItem ? this.cartItem?.variation_id : null,
      variation: this.cartItem ? this.cartItem?.variation : null,
      quantity: qty,
    };
    this.store.dispatch(new AddToCartAction(params));
  }
}
