import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { ProductBox } from '../../../../shared/components/widgets/product-box/product-box';
import { horizontalProductSlider, productSlider } from '../../../../shared/data/owl-carousel';
import { IProduct } from '../../../../shared/interface/product.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { ProductState } from '../../../../shared/store/state/product.state';

@Component({
  selector: 'app-theme-product',
  imports: [ProductBox, CarouselModule, NoData, TranslateModule, NgClass],
  templateUrl: './theme-product.html',
  styleUrl: './theme-product.scss',
})
export class ThemeProduct {
  productService = inject(ProductService);

  readonly productIds = input<number[]>([]);
  readonly style = input<string>();
  readonly options = input<OwlOptions>(productSlider);
  readonly slider = input<boolean>();
  readonly class = input<string>();
  readonly type = input<string>();
  readonly product_box_style = input<string>();

  public products: IProduct[] = [];
  public horizontalSliderOption = horizontalProductSlider;

  product$: Observable<IProduct[]> = inject(Store).select(ProductState.productByIds);

  ngOnChanges() {
    const productIds = this.productIds();
    if (Array.isArray(productIds) && productIds.length) {
      this.product$.subscribe(products => {
        this.products = products.filter(product => this.productIds()?.includes(product.id));
      });
    }
  }
}
