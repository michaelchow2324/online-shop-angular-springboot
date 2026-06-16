import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, PLATFORM_ID, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, Subscription } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { Button } from '../../../../shared/components/widgets/button/button';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { ProductBox } from '../../../../shared/components/widgets/product-box/product-box';
import { productSlider } from '../../../../shared/data/owl-carousel';
import { ICategoryModel } from '../../../../shared/interface/category.interface';
import { Params } from '../../../../shared/interface/core.interface';
import { IProduct, IProductModel } from '../../../../shared/interface/product.interface';
import { IFashionSeven, IFeaturedBanner } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import {
  GetMoreProductAction,
  GetProductByIdsAction,
  GetProductsAction,
} from '../../../../shared/store/action/product.action';
import { CategoryState } from '../../../../shared/store/state/category.state';
import { ProductState } from '../../../../shared/store/state/product.state';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-fashion-7',
  imports: [
    TranslateModule,
    ImageLink,
    ThemeTitle,
    ThemeProduct,
    ProductBox,
    ThemeBrand,
    Button,
    NgClass,
  ],
  templateUrl: './fashion-7.html',
  styleUrl: './fashion-7.scss',
})
export class Fashion7 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);
  moreProduct$: Observable<IProduct[]> = inject(Store).select(ProductState.moreProduct);
  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.category);

  readonly data = input<IFashionSeven>();
  readonly slug = input<string>();

  public finished: boolean;
  public total_product: number;
  public button_loader: boolean = false;
  public options = productSlider;
  public paginateProducts: IProduct[] = [];
  public allProducts: IProduct[] = []; // Store all fetched products

  public banners: IFeaturedBanner[];

  private productSubscription: Subscription;
  private productsSubscription: Subscription;
  public StorageURL = environment.storageURL;

  public filter: Params = {
    page: 1, // Current page number
    paginate: 4, // Display per page,
    status: 1,
    approve: 1,
    category_id: '',
  };
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.filter['category_id'] = data?.content.products_list_1.category_id;

      this.productsSubscription = this.moreProduct$.subscribe(productList => {
        if (productList && productList.length) {
          this.allProducts = productList;
          this.total_product = this.allProducts.length;

          this.paginateProducts = this.allProducts.slice(0, 4);
          this.finished = this.paginateProducts.length >= this.total_product;
        }
      });

      this.banners = [];
      if (data?.content?.featured_banners?.banner_1?.status) {
        this.banners = [...this.banners, data?.content?.featured_banners?.banner_1];
      }
      if (data?.content?.featured_banners?.banner_2?.status) {
        this.banners = [...this.banners, data?.content?.featured_banners?.banner_2];
      }
      if (data?.content?.featured_banners?.banner_3?.status) {
        this.banners = [...this.banners, data?.content?.featured_banners?.banner_3];
      }

      this.options = {
        ...this.options,
        responsive: {
          0: {
            items: 1,
          },
          668: {
            items: 2,
          },
          992: {
            items: 3,
          },
        },
      };

      // Get Products
      const getProducts$ = this.store.dispatch(
        new GetProductByIdsAction({
          status: 1,
          approve: 1,
          ids: data?.content?.products_ids?.join(','),
          paginate: data?.content?.products_ids?.length,
        }),
      );

      // Get Products
      const getMoreProducts$ = this.store.dispatch(new GetMoreProductAction(this.filter));

      // Get Brand
      const getBrands$ = this.store.dispatch(
        new GetBrandsAction({
          status: 1,
          ids: data?.content?.brand?.brand_ids?.join(','),
        }),
      );

      if (this.platformId) {
        // Skeleton Loader
        document.body.classList.add('skeleton-body');

        forkJoin([getProducts$, getBrands$, getMoreProducts$]).subscribe({
          complete: () => {
            this.store.dispatch(new GetProductsAction(this.filter));

            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  loadMore() {
    if (this.paginateProducts.length < this.total_product) {
      this.button_loader = true;

      setTimeout(() => {
        const nextProducts = this.allProducts.slice(
          this.paginateProducts.length,
          this.paginateProducts.length + 4,
        );
        this.paginateProducts = [...this.paginateProducts, ...nextProducts];

        this.finished = this.paginateProducts.length >= this.total_product;
        this.button_loader = false;
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.productSubscription && this.productsSubscription) {
      this.productSubscription.unsubscribe();
      this.productsSubscription.unsubscribe();
    }
  }
}
