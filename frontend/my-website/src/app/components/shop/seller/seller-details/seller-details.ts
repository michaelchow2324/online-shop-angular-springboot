import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';

import { Breadcrumb } from '../../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBreadcrumb } from '../../../../shared/interface/breadcrumb.interface';
import { Params } from '../../../../shared/interface/core.interface';
import { IProductModel } from '../../../../shared/interface/product.interface';
import { IStores } from '../../../../shared/interface/store.interface';
import { IOption } from '../../../../shared/interface/theme-option.interface';
import { GetProductsAction } from '../../../../shared/store/action/product.action';
import { ProductState } from '../../../../shared/store/state/product.state';
import { StoreState } from '../../../../shared/store/state/store.state';
import { ThemeOptionState } from '../../../../shared/store/state/theme-option.state';
import { CollectionProducts } from '../../collection/widgets/collection-products/collection-products';
import { Sidebar } from '../../collection/widgets/sidebar/sidebar';
import { SellerStoreLogo } from '../widgets/seller-store-logo/seller-store-logo';
import { SellerStoreSocialMedia } from '../widgets/seller-store-social-media/seller-store-social-media';

@Component({
  selector: 'app-seller-details',
  imports: [
    Breadcrumb,
    CollectionProducts,
    Sidebar,
    SellerStoreLogo,
    NgbRatingModule,
    TranslateModule,
    SellerStoreSocialMedia,
    NgClass,
    TitleCasePipe,
  ],
  templateUrl: './seller-details.html',
  styleUrl: './seller-details.scss',
})
export class SellerDetails {
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);
  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;
  store$: Observable<IStores> = inject(Store).select(
    StoreState.selectedStore,
  ) as Observable<IStores>;

  public breadcrumb: IBreadcrumb = {
    title: 'Seller',
    items: [],
  };
  public layout: string = 'basic_store_details';
  public skeleton: boolean = true;
  public selectedStore: IStores;
  public filter: Params = {
    page: 1, // Current page number
    paginate: 40, // Display per page,
    status: 1,
    field: 'price',
    price: '',
    category: '',
    tag: '',
    sort: '', // ASC, DSC
    sortBy: '',
    rating: '',
    attribute: '',
  };

  public totalItems: number = 0;

  ngOnInit(): void {
    // Subscribe to store changes
    this.store$.subscribe(store => {
      this.selectedStore = store;
    });

    // Combine latest values from params and queryParams observables
    combineLatest([this.route.params, this.route.queryParams]).subscribe(
      ([params, queryParams]) => {
        // Update filter based on query params
        this.filter = {
          page: queryParams['page'] || 1,
          paginate: 40,
          status: 1,
          field: queryParams['field'] || '',
          price: queryParams['price'] || '',
          category: queryParams['category'] || '',
          tag: queryParams['tag'] || '',
          sort: queryParams['sort'] || '',
          sortBy: queryParams['sortBy'] || '',
          rating: queryParams['rating'] || '',
          attribute: queryParams['attribute'] || '',
          store_slug: params['slug'] || '',
          layout: queryParams['layout'] || 'basic_store_details',
        };

        // Update breadcrumb
        this.breadcrumb.items = [];
        this.breadcrumb.title = this.filter['store_slug'] ? this.filter['store_slug'] : 'Seller';
        this.breadcrumb.items.push(
          { label: 'Seller Store', active: true },
          { label: this.breadcrumb.title, active: false },
        );

        // Dispatch action to fetch products
        this.store.dispatch(new GetProductsAction(this.filter));

        // If layout is not in query params, set default layout
        if (!queryParams['layout']) {
          this.layout = 'basic_store_details';
        } else {
          this.layout = queryParams['layout'];
        }

        // Update filter with layout
        this.filter['layout'] = this.layout;
      },
    );

    // Subscribe to product store to get total items
    this.product$.subscribe(product => (this.totalItems = product?.total));
    // this.store.select('products').subscribe(product => {
    //   this.totalItems = product?.total;
    // });
  }
}
