import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { CollectionCategorySidebar } from './collection-category-sidebar/collection-category-sidebar';
import { CollectionCategorySlider } from './collection-category-slider/collection-category-slider';
import { CollectionLeftSidebar } from './collection-left-sidebar/collection-left-sidebar';
import { CollectionList } from './collection-list/collection-list';
import { CollectionNoSidebar } from './collection-no-sidebar/collection-no-sidebar';
import { CollectionProductInfiniteScroll } from './collection-product-infinite-scroll/collection-product-infinite-scroll';
import { CollectionRightSidebar } from './collection-right-sidebar/collection-right-sidebar';
import { CollectionSidebarPopup } from './collection-sidebar-popup/collection-sidebar-popup';
import { CollectionTopFilter } from './collection-top-filter/collection-top-filter';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { Params } from '../../../shared/interface/core.interface';
import { IProductModel } from '../../../shared/interface/product.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import {
  GetMoreProductAction,
  GetProductsAction,
} from '../../../shared/store/action/product.action';
import { ProductState } from '../../../shared/store/state/product.state';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-collection',
  imports: [
    Breadcrumb,
    CollectionLeftSidebar,
    CollectionRightSidebar,
    CollectionNoSidebar,
    CollectionList,
    CollectionTopFilter,
    CollectionCategorySlider,
    CollectionCategorySidebar,
    CollectionSidebarPopup,
    CollectionProductInfiniteScroll,
  ],
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
})
export class Collection {
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);
  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public layout: string = 'collection_category_slider';
  public skeleton: boolean = true;
  public breadcrumb: IBreadcrumb = {
    title: 'Collections',
    items: [{ label: 'Collections', active: false }],
  };

  public filter: Params = {
    page: 1, // Current page number
    paginate: 12, // Display per page,
    status: 1,
    field: 'created_at',
    price: '',
    category: '',
    tag: '',
    sort: 'asc', // ASC, DSC
    sortBy: 'asc',
    rating: '',
    attribute: '',
    brand: '',
  };

  public scrollFilter: Params = {
    page: 1,
    paginate: 9,
  };

  public totalItems: number = 0;

  constructor() {
    // Get Query params..
    this.route.queryParams.subscribe(params => {
      this.filter = {
        page: params['page'] ? params['page'] : 1,
        paginate: params['paginate'] ? params['paginate'] : 12,
        status: 1,
        field: params['field'] ? params['field'] : this.filter['field'],
        price: params['price'] ? params['price'] : '',
        category: params['category'] ? params['category'] : '',
        tag: params['tag'] ? params['tag'] : '',
        sortBy: params['sortBy'] ? params['sortBy'] : this.filter['sortBy'],
        rating: params['rating'] ? params['rating'] : '',
        attribute: params['attribute'] ? params['attribute'] : '',
        brand: params['brand'] ? params['brand'] : '',
      };

      this.scrollFilter = {
        ...this.filter,
        page: this.scrollFilter['page'],
        paginate: this.scrollFilter['paginate'],
      };

      this.store.dispatch(new GetProductsAction(this.filter));
      // Params For Demo Purpose only
      if (params['layout']) {
        this.layout = params['layout'];

        if (this.layout == 'collection_product_infinite_scroll') {
          this.store.dispatch(new GetMoreProductAction(this.scrollFilter));
        }
      } else {
        // Get Collection Layout
        this.themeOptions$.subscribe(option => {
          this.layout =
            option?.collection && option?.collection?.collection_layout
              ? option?.collection?.collection_layout
              : 'collection_category_slider';
        });
      }

      this.filter['layout'] = this.layout;
    });

    this.product$.subscribe(product => (this.totalItems = product?.total));
  }
}
