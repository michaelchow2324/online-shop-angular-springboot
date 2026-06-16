import { AsyncPipe } from '@angular/common';
import { Component, inject, SimpleChanges, input, Input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { NoData } from '../../../../../shared/components/widgets/no-data/no-data';
import { ProductBox } from '../../../../../shared/components/widgets/product-box/product-box';
import { ProductBoxEleven } from '../../../../../shared/components/widgets/product-box/product-box-eleven/product-box-eleven';
import { SkeletonProductBox } from '../../../../../shared/components/widgets/product-box/widgets/skeleton-product-box/skeleton-product-box';
import { IProduct, IProductModel } from '../../../../../shared/interface/product.interface';
import { ProductService } from '../../../../../shared/services/product.service';
import { GetMoreProductAction } from '../../../../../shared/store/action/product.action';
import { ProductState } from '../../../../../shared/store/state/product.state';
import { CollectionPaginate } from '../collection-paginate/collection-paginate';
import { CollectionSort } from '../collection-sort/collection-sort';

@Component({
  selector: 'app-collection-products',
  imports: [
    TranslateModule,
    ProductBox,
    CollectionSort,
    CollectionPaginate,
    NoData,
    ProductBoxEleven,
    SkeletonProductBox,
    AsyncPipe,
  ],
  templateUrl: './collection-products.html',
  styleUrl: './collection-products.scss',
})
export class CollectionProducts {
  private store = inject(Store);
  productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);
  moreProduct$: Observable<IProduct[]> = inject(Store).select(ProductState.moreProduct);

  @Input() filter: Params;
  readonly gridCol = input<string>();
  readonly topFilter = input<boolean>(false);
  readonly infiniteScroll = input<boolean>(false);

  public gridClass: string = 'col-xl-3 col-6';
  public listView: boolean = false;
  public products: number;
  public button_text: string;
  public total_product: number;
  public button_loader: boolean = false;
  public finished: boolean = false; // boolean when end of data is reached
  public productsArray: IProduct[];
  public paginateProduct: IProduct[];
  private productSubscription: Subscription;
  private moreProductSubscription: Subscription;
  public total: number;
  public skeletonItems = Array.from({ length: 40 }, (_, index) => index);

  public scrollFilter: Params = {
    page: 1,
    paginate: 9,
  };

  public pagination: number = 9;

  ngOnInit() {
    this.product$.subscribe(res => {
      this.productsArray = res.data;
      this.total = res.total;
    });
    this.setPage();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.filter = changes['filter'].currentValue;
    this.route.queryParams.subscribe(() => {
      this.total_product = 0;
      this.productSubscription = this.product$.subscribe(product => {
        if (product && product.total) {
          this.total_product = product.total;
        }
      });
      const filter = this.filter;
      if (filter['layout'] == 'collection_product_infinite_scroll') {
        this.moreProductSubscription = this.moreProduct$.subscribe(product => {
          if (product && product.length) {
            this.products = product.length;
          }
          if (this.total_product != this.products) {
            this.finished = false;
          } else {
            this.finished = true;
          }
        });
        this.scrollFilter = {
          ...filter,
          page: this.scrollFilter['page'],
          paginate: this.scrollFilter['paginate'],
        };
      }

      void this.router.events.forEach(event => {
        if (event instanceof NavigationEnd) {
          if (this.productSubscription && this.moreProductSubscription) {
            this.productSubscription.unsubscribe();
            this.moreProductSubscription.unsubscribe();
          }
        }
      });
    });
  }

  setGridClass(value: { class: string; list_view: boolean }) {
    this.gridClass = value.class;
    this.listView = value.list_view;
  }

  onScroll(value: number) {
    if (this.products != this.total_product) {
      this.button_loader = true;
      this.scrollFilter['page'] = this.scrollFilter['page'] + value;
      this.store.dispatch(new GetMoreProductAction(this.scrollFilter, true)).subscribe({
        complete: () => {
          this.button_loader = false;
        },
      });
    } else {
      this.finished = true;
    }
  }
  count = 0;

  setPage() {
    this.product$.subscribe(res => {
      this.productsArray = res.data;
      this.paginateProduct = this.productsArray
        .map(product => ({ ...product }))
        .slice(
          (this.filter!['page'] - 1) * this.filter['paginate'],
          (this.filter!['page'] - 1) * this.filter['paginate'] + this.filter['paginate'],
        );
    });

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.filter!['page'],
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }

  ngOnDestroy() {
    if (this.productSubscription && this.moreProductSubscription) {
      this.productSubscription.unsubscribe();
      this.moreProductSubscription.unsubscribe();
    }
  }
}
