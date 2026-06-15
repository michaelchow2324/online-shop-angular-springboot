import { isPlatformBrowser } from '@angular/common';
import { Component, inject, input, PLATFORM_ID, viewChild } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICart, ICartAddOrUpdate } from '../../../../../interface/cart.interface';
import { IProduct, IVariation } from '../../../../../interface/product.interface';
import { AddToCartAction, UpdateCartAction } from '../../../../../store/action/cart.action';
import { CartState } from '../../../../../store/state/cart.state';
import { Button } from '../../../button/button';
import { ProductDetailsModal } from '../../../modal/product-details-modal/product-details-modal';

@Component({
  selector: 'app-cart-button',
  imports: [Button, TranslateModule],
  templateUrl: './cart-button.html',
  styleUrl: './cart-button.scss',
})
export class CartButton {
  private store = inject(Store);
  private modal = inject(NgbModal);

  readonly product = input<IProduct>();
  readonly text = input<string>();
  readonly class = input<string>();
  readonly iconClass = input<string>('');
  readonly selectedVariation = input<IVariation | null>();
  readonly enableModal = input<boolean>(false);
  readonly quantity = input<boolean>(false);

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);

  readonly productDetailModal = viewChild<ProductDetailsModal>('productDetailModal');

  public cartItem: ICart | null;
  public currentDate: number | null;
  public saleStartDate: number | null;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => item.product.id == this.product()?.id)!;
    });
  }

  addToCart(product: IProduct, qty: number) {
    if (product) {
      const selectedVariation = this.selectedVariation();
      const selectedVariationValue = this.selectedVariation();
      const selectedVariationVal = this.selectedVariation();
      const params: ICartAddOrUpdate = {
        id:
          this.cartItem &&
          selectedVariation &&
          this.cartItem?.variation &&
          selectedVariation?.id == this.cartItem?.variation?.id
            ? this.cartItem.id
            : null,
        product_id: product?.id!,
        product: product ? product : null,
        variation: selectedVariationValue ? selectedVariationValue : null,
        variation_id: selectedVariationVal?.id ? selectedVariationVal?.id! : null,
        quantity: qty,
      };

      this.store.dispatch(new AddToCartAction(params));
    }
  }

  updateQuantity(product: IProduct, qty: number) {
    const params: ICartAddOrUpdate = {
      id: this.cartItem ? this.cartItem.id : null,
      product: product,
      product_id: product?.id,
      variation_id: this.cartItem ? this.cartItem?.variation_id : null,
      variation: this.cartItem ? this.cartItem?.variation : null,
      quantity: qty,
    };
    this.store.dispatch(new UpdateCartAction(params));
  }

  externalProductLink(link: string) {
    if (this.isBrowser) {
      if (link) {
        window.open(link, '_blank');
      }
    }
  }

  openModal(product: IProduct) {
    const modal = this.modal.open(ProductDetailsModal, {
      centered: true,
      size: 'lg',
      windowClass: 'theme-modal-2 cart-view-modal',
    });
    modal.componentInstance.product = product;
  }
}
