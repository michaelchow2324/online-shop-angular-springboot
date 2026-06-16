import { SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { ProductBox } from '../../../shared/components/widgets/product-box/product-box';
import { SkeletonProductBox } from '../../../shared/components/widgets/product-box/widgets/skeleton-product-box/skeleton-product-box';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { Params } from '../../../shared/interface/core.interface';
import { IProduct, IProductModel } from '../../../shared/interface/product.interface';
import { ProductService } from '../../../shared/services/product.service';
import { GetProductsAction } from '../../../shared/store/action/product.action';
import { ProductState } from '../../../shared/store/state/product.state';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Breadcrumb,
    Button,
    ProductBox,
    NoData,
    SkeletonProductBox,
    SlicePipe,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private store = inject(Store);
  productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  public breadcrumb: IBreadcrumb = {
    title: 'Search',
    items: [{ label: 'Search', active: true }],
  };

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);

  public products: IProduct[];
  public search = new FormControl();
  public totalItems: number = 0;
  public skeletonItems = Array.from({ length: 12 }, (_, index) => index);
  public filter: Params = {
    page: 1, // Current page number
    paginate: 12, // Display per page,
    status: 1,
    search: '',
  };

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.filter['search'] = params['search'];
        this.search.patchValue(params['search'] ? params['search'] : '');
      }
      this.store.dispatch(new GetProductsAction(this.filter));

      this.product$.subscribe(products => {
        this.products = products.data;
      });
    });
  }

  ngOnInit() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged()) // Adjust the debounce time as needed (in milliseconds)
      .subscribe(inputValue => {
        if (inputValue.length >= 0) {
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              search: inputValue,
            },
          });
          this.filter['search'] = inputValue;
        }
      });
  }

  searchProduct() {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search.value,
      },
    });
    this.filter['search'] = this.search.value;
  }
}
