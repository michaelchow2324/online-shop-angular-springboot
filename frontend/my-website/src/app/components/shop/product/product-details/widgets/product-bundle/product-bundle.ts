import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

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
import { ProductState } from '../../../../../../shared/store/state/product.state';

@Component({
  selector: 'app-product-bundle',
  imports: [TranslateModule, RouterModule, CurrencySymbolPipe, Button, DropdownVariant],
  templateUrl: './product-bundle.html',
  styleUrl: './product-bundle.scss',
})
export class ProductBundle {
  private store = inject(Store);

  crossSellProduct$: Observable<IProduct[]> = inject(Store).select(ProductState.relatedProducts);
  cartItem$: Observable<ICart[]> = inject(Store).select(CartState.cartItems);

  readonly product = input<IProduct | null>();

  public cartItem: ICart | null;

  public crossSellProducts: IProduct[] = [];
  public crossSellProductsIds: number[] = [];
  public selectedProduct: any[] = [];
  public selectedProductIds: number[] = [];
  public selectedVariation: IVariation;

  public total: number = 0;

  ngOnChanges() {
    const productValue = this.product();
    if (productValue?.cross_sell_products && Array.isArray(productValue?.cross_sell_products)) {
      this.crossSellProduct$.subscribe(products => {
        this.crossSellProducts = products.filter(product =>
          this.product()?.cross_sell_products?.includes(product?.id!),
        );
        this.crossSellProductsIds = this.crossSellProducts.map(product => {
          return product && product?.id;
        });
      });
    }
  }

  select(event: Event, productId: number) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    if (isChecked) {
      this.selectedProductIds.push(productId);
    } else {
      const index = this.selectedProductIds.indexOf(productId);
      if (index !== -1) {
        this.selectedProductIds.splice(index, 1);
      }
    }

    this.crossSellProduct$.subscribe(products => {
      const dataProducts = [...products, this.selectedVariation];
      this.selectedProduct = dataProducts.filter(product =>
        this.selectedProductIds?.includes(product?.id!),
      );
    });

    this.total = this.selectedProduct.reduce(
      (sum, item) =>
        sum + (item.selected_variant ? item.selected_variant.sale_price : item.sale_price),
      0,
    );
  }

  isChecked(productId: any): boolean {
    return this.selectedProductIds.includes(productId);
  }

  addToCartAll() {
    this.selectedProduct.forEach(product => {
      if (product) {
        this.cartItem$.subscribe(items => {
          this.cartItem = items.find(item => item.product.id == product.id)!;
        });
        const params: ICartAddOrUpdate = {
          id:
            this.cartItem &&
            product.selected_variant &&
            this.cartItem?.variation &&
            product.selected_variant?.id == this.cartItem?.variation?.id
              ? this.cartItem.id
              : null,
          product_id: product?.id,
          product: product ? product : null,
          variation: product.selected_variant ? product.selected_variant : null,
          variation_id: product.selected_variant ? product?.selected_variant?.id : null,
          quantity: 1,
        };
        this.store.dispatch(new AddToCartAction(params));
      }
    });
  }

  getSelectedVariant(option: IVariation, products: IProduct) {
    if (option) {
      const index = this.crossSellProducts.findIndex(product => product.id === products.id);
      products['selected_variant'] = option;
      this.crossSellProducts[index] = products;
      this.selectedVariation = option;
      this.total = this.selectedProduct.reduce(
        (sum, item) =>
          sum + (item.selected_variant ? item.selected_variant.sale_price : item.sale_price),
        0,
      );
    }
  }
}
