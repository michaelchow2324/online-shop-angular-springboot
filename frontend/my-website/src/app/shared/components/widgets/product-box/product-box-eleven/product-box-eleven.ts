import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICart } from '../../../../interface/cart.interface';
import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartState } from '../../../../store/state/cart.state';
import { result } from '../product-box-two/product-box-two';
import { CartButton } from '../widgets/cart-button/cart-button';
import { DropdownVariant } from '../widgets/dropdown-variant/dropdown-variant';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';

@Component({
  selector: 'app-product-box-eleven',
  imports: [
    RouterModule,
    NgbModule,
    TranslateModule,
    CurrencySymbolPipe,
    ProductHoverAction,
    CartButton,
    ProductBoxImageVariant,
    DropdownVariant,
  ],
  templateUrl: './product-box-eleven.html',
  styleUrl: './product-box-eleven.scss',
})
export class ProductBoxEleven {
  readonly product = input<IProduct>();

  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);

  public selectedVariation: IVariation | null;
  public soldOutAttributesIds: number[] = [];
  public cartItem: ICart | null;
  public result: result[] = [];

  constructor() {
    const config = inject(NgbRatingConfig);

    config.max = 5;
    config.readonly = true;
  }

  ngOnInit() {
    this.cartItem$.subscribe(items => {
      this.cartItem = items.find(item => {
        if (item.variation_id) {
          this.product()?.variations.find(i => {
            return i.id == item.variation_id;
          });
        } else {
          return item.product.id == this.product()?.id;
        }
      })!;
    });
  }

  // Select First Attribute
  checkVariant(item: IVariation, i: number) {
    if (item.stock_status == 'in_stock' && item.status) {
      if (
        item.stock_status === 'in_stock' &&
        item.status &&
        i ===
          this.result.findIndex(obj => obj.value.stock_status === 'in_stock' && obj.value.status)
      ) {
        return true;
      }
    }
  }

  // Change Variation
  getSelectedVariant(option: IVariation) {
    if (option) {
      this.selectedVariation = option;
    }
  }
}
