import { Component, inject, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ProductBox } from '../../../../../../shared/components/widgets/product-box/product-box';
import { IProduct } from '../../../../../../shared/interface/product.interface';
import { ProductState } from '../../../../../../shared/store/state/product.state';

@Component({
  selector: 'app-related-product',
  imports: [TranslateModule, ProductBox],
  templateUrl: './related-product.html',
  styleUrl: './related-product.scss',
})
export class RelatedProduct {
  relatedProduct$: Observable<IProduct[]> = inject(Store).select(ProductState.relatedProducts);

  readonly product = input<IProduct | null>();

  public relatedProducts: IProduct[] = [];

  ngOnChanges() {
    const productValue = this.product();
    if (productValue?.related_products && Array.isArray(productValue?.related_products)) {
      this.relatedProduct$.subscribe(products => {
        this.relatedProducts = products.filter(product =>
          this.product()?.related_products?.includes(product?.id),
        );
      });
    }
  }
}
