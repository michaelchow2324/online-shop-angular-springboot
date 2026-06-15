import { SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ProductBox } from '../../../../../../shared/components/widgets/product-box/product-box';
import { IProduct } from '../../../../../../shared/interface/product.interface';
import { ProductState } from '../../../../../../shared/store/state/product.state';

@Component({
  selector: 'app-trending-product',
  imports: [TranslateModule, ProductBox, SlicePipe],
  templateUrl: './trending-product.html',
  styleUrl: './trending-product.scss',
})
export class TrendingProduct {
  relatedProduct$: Observable<IProduct[]> = inject(Store).select(ProductState.relatedProducts);

  public relatedProducts: IProduct[] = [];

  ngOnInit() {
    this.relatedProduct$.subscribe(products => {
      this.relatedProducts = products?.length
        ? products?.filter(product => product?.is_trending)
        : [];
    });
  }
}
