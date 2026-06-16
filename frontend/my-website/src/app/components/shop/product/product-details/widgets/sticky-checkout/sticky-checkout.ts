import { isPlatformBrowser } from '@angular/common';
import { Component, inject, Input, PLATFORM_ID, SimpleChanges } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Button } from '../../../../../../shared/components/widgets/button/button';
import { DropdownVariant } from '../../../../../../shared/components/widgets/product-box/widgets/dropdown-variant/dropdown-variant';
import { ICart, ICartAddOrUpdate } from '../../../../../../shared/interface/cart.interface';
import { IProduct, IVariation } from '../../../../../../shared/interface/product.interface';
import { CurrencySymbolPipe } from '../../../../../../shared/pipe/currency.pipe';
import { AddToCartAction } from '../../../../../../shared/store/action/cart.action';
import { CartState } from '../../../../../../shared/store/state/cart.state';

@Component({
  selector: 'app-sticky-checkout',
  imports: [CurrencySymbolPipe, TranslateModule, Button, DropdownVariant],
  templateUrl: './sticky-checkout.html',
  styleUrl: './sticky-checkout.scss',
})
export class StickyCheckout {
  private store = inject(Store);

  @Input() product: IProduct;

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);

  public cartItem: ICart | null;
  public productQty: number = 1;
  public selectedVariation: IVariation | null;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product'] && changes['product'].currentValue) {
      this.selectedVariation = null;
      this.product = changes['product']?.currentValue;
    }

    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => {
        if (item.variation_id) {
          const variations = Array.isArray(this.product.variations) ? this.product.variations : [];
          variations.find(i => {
            return i.id == item.variation_id;
          });
        } else {
          return item.product.id == this.product.id;
        }
      })!;
    });
  }

  selectVariation(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
    }
  }

  updateQuantity(qty: number) {
    if (1 > this.productQty + qty) return;
    this.productQty = this.productQty + qty;
  }

  addToCart(product: IProduct) {
    if (product) {
      const params: ICartAddOrUpdate = {
        id:
          this.cartItem &&
          this.selectedVariation &&
          this.cartItem?.variation &&
          this.selectedVariation?.id == this.cartItem?.variation?.id
            ? this.cartItem.id
            : null,
        product_id: product?.id!,
        product: product ? product : null,
        variation: this.selectedVariation ? this.selectedVariation : null,
        variation_id: this.selectedVariation?.id ? this.selectedVariation?.id : null,
        quantity: this.productQty,
      };
      this.store.dispatch(new AddToCartAction(params));
    }
  }

  externalProductLink(link: string) {
    if (this.isBrowser) {
      if (link) {
        window.open(link, '_blank');
      }
    }
  }
}
