import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { ICart, ICartAddOrUpdate } from '../../../../interface/cart.interface';
import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { ReplaceCartAction } from '../../../../store/action/cart.action';
import { Button } from '../../button/button';
import { VariantAttributes } from '../../variant-attributes/variant-attributes';

@Component({
  selector: 'app-variation-modal',
  imports: [TranslateModule, CurrencySymbolPipe, RouterModule, Button, VariantAttributes],
  templateUrl: './variation-modal.html',
  styleUrl: './variation-modal.scss',
})
export class VariationModal {
  modal = inject(NgbActiveModal);
  private store = inject(Store);

  readonly variation = input<ICart>();

  public product: IProduct;
  public productQty: number = 1;
  public selectedVariation: IVariation | null;

  ngOnInit() {
    this.product = this.variation()!.product;
    this.productQty = this.variation()!.quantity;
  }

  selectVariation(variation: IVariation) {
    this.selectedVariation = variation;
  }

  updateQuantity(qty: number) {
    if (1 > this.productQty + qty) return;
    this.productQty = this.productQty + qty;
  }

  replaceCart(product: IProduct) {
    const variation = this.variation();
    if (product && variation) {
      const params: ICartAddOrUpdate = {
        id: variation.id,
        product_id: product?.id,
        product: product ? product : null,
        variation: this.selectedVariation ? this.selectedVariation : null,
        variation_id: this.selectedVariation ? this.selectedVariation.id : null,
        quantity: this.productQty,
      };

      this.store.dispatch(new ReplaceCartAction(params)).subscribe({
        complete: () => {
          this.modal.close();
        },
      });
    }
  }
}
