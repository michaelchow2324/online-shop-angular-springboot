import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IBrand, IBrandModel } from '../../../../../../shared/interface/brand.interface';
import { IProduct } from '../../../../../../shared/interface/product.interface';
import { IOption } from '../../../../../../shared/interface/theme-option.interface';
import { BrandService } from '../../../../../../shared/services/brand.service';
import { ProductService } from '../../../../../../shared/services/product.service';
import { GetBrandsAction } from '../../../../../../shared/store/action/brand.action';
import { BrandState } from '../../../../../../shared/store/state/brand.state';
import { ThemeOptionState } from '../../../../../../shared/store/state/theme-option.state';
import { TrendingProduct } from '../trending-product/trending-product';
import { ProductBrandFilter } from './product-brand-filter/product-brand-filter';
import { ProductSidebarServices } from './product-sidebar-services/product-sidebar-services';
import { SkeletonProductSidebar } from './skeleton-product-sidebar/skeleton-product-sidebar';

@Component({
  selector: 'app-product-details-sidebar',
  imports: [
    NgbModule,
    TranslateModule,
    ProductBrandFilter,
    TrendingProduct,
    ProductSidebarServices,
    SkeletonProductSidebar,
    AsyncPipe,
  ],
  templateUrl: './product-details-sidebar.html',
  styleUrl: './product-details-sidebar.scss',
})
export class ProductDetailsSidebar {
  private productService = inject(ProductService);
  brandService = inject(BrandService);
  private store = inject(Store);

  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;
  brand$: Observable<IBrandModel> = inject(Store).select(BrandState.brand);

  readonly product = input<IProduct>();

  public brands: IBrand[];

  ngOnInit() {
    this.store.dispatch(new GetBrandsAction({ status: 1 }));
    this.brand$.subscribe(brand => {
      this.brands = brand.data;
    });
  }

  closeFilter() {
    this.productService.productFilter = false;
  }
}
