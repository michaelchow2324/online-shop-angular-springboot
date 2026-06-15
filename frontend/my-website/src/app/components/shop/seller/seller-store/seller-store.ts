import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Breadcrumb } from '../../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../../../shared/components/widgets/pagination/pagination';
import { IBreadcrumb } from '../../../../shared/interface/breadcrumb.interface';
import { IStoresModel } from '../../../../shared/interface/store.interface';
import { IOption } from '../../../../shared/interface/theme-option.interface';
import { StoreService } from '../../../../shared/services/store.service';
import { GetStoreProductsAction } from '../../../../shared/store/action/product.action';
import { GetStoresAction } from '../../../../shared/store/action/store.action';
import { StoreState } from '../../../../shared/store/state/store.state';
import { ThemeOptionState } from '../../../../shared/store/state/theme-option.state';
import { SellerContactDetails } from '../widgets/seller-contact-details/seller-contact-details';
import { SellerStoreLogo } from '../widgets/seller-store-logo/seller-store-logo';
import { SellerStoreProductCount } from '../widgets/seller-store-product-count/seller-store-product-count';
import { SellerStoreProducts } from '../widgets/seller-store-products/seller-store-products';
import { SellerStoreRating } from '../widgets/seller-store-rating/seller-store-rating';
import { SkeletonSeller } from '../widgets/skeleton-seller/skeleton-seller';

@Component({
  selector: 'app-seller-store',
  imports: [
    Breadcrumb,
    Pagination,
    RouterModule,
    SellerStoreLogo,
    NoData,
    SellerStoreProductCount,
    SellerStoreProducts,
    SellerStoreRating,
    SellerContactDetails,
    TranslateModule,
    SkeletonSeller,
    AsyncPipe,
    TitleCasePipe,
  ],
  templateUrl: './seller-store.html',
  styleUrl: './seller-store.scss',
})
export class SellerStore {
  store = inject(Store);
  private route = inject(ActivatedRoute);
  storeService = inject(StoreService);

  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;
  store$: Observable<IStoresModel> = inject(Store).select(StoreState.store);

  public breadcrumb: IBreadcrumb = {
    title: 'Seller Stores',
    items: [{ label: 'Seller Stores', active: true }],
  };
  public totalItems: number = 0;
  public filter = {
    status: 1,
    page: 1, // Current page number
    paginate: 28, // Display per page,
  };

  public skeletonItems = Array.from({ length: 6 }, (_, index) => index);

  constructor() {
    // Params For Demo Purpose only
    this.route.queryParams.subscribe(_params => {
      this.store.dispatch(new GetStoresAction(this.filter));
      this.store$.subscribe(store => (this.totalItems = store?.total));
    });

    this.store$.subscribe(store => {
      const storeIds = store?.data.map(store => store.id);
      if (Array.isArray(storeIds) && storeIds.length) {
        this.store.dispatch(
          new GetStoreProductsAction({ status: 1, store_ids: storeIds?.join(',') }),
        );
      }
    });
  }

  setPaginate(data: number) {
    this.filter.page = data;
    this.store.dispatch(new GetStoresAction(this.filter));
  }
}
