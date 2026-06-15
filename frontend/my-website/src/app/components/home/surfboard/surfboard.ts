import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { productSlider4, productSlider5 } from '../../../shared/data/owl-carousel';
import { IBanners, ISurfboard } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-surfboard',
  imports: [
    ThemeHomeSlider,
    ThemeTitle,
    Categories,
    ThemeProduct,
    ThemeProductTabSection,
    ThemeSocialMedia,
    ThemeBrand,
    RouterModule,
    ImageLink,
  ],
  templateUrl: './surfboard.html',
  styleUrl: './surfboard.scss',
})
export class Surfboard {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<ISurfboard>();
  readonly slug = input<string>();
  private platformId: boolean;
  public productSlider5 = productSlider5;
  public productSlider4 = productSlider4;
  public banners: IBanners[];

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      // Get Products
      let getProducts$;
      if (data?.content?.products_ids.length && data?.content?.products_list?.status) {
        getProducts$ = this.store.dispatch(
          new GetProductByIdsAction({
            status: 1,
            approve: 1,
            ids: data?.content?.products_ids?.join(','),
            paginate: data?.content?.products_ids?.length,
          }),
        );
      } else {
        getProducts$ = of(null);
      }

      // Get Category
      let getCategory$;
      let categoryIds: number[] = [];

      if (data?.content?.categories?.category_ids?.length)
        categoryIds = [...categoryIds, ...data?.content?.categories?.category_ids];
      if (data?.content?.category_product?.category_ids?.length)
        categoryIds = [...categoryIds, ...data?.content?.category_product?.category_ids];

      if (
        categoryIds?.length &&
        (data?.content.categories.category_ids || data?.content.category_product?.status)
      ) {
        getCategory$ = this.store.dispatch(
          new GetCategoriesAction({
            status: 1,
            ids: categoryIds?.join(','),
          }),
        );
      } else {
        getCategory$ = of(null);
      }

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.brand_ids?.length && data?.content?.brand?.status) {
        getBrands$ = this.store.dispatch(
          new GetBrandsAction({
            status: 1,
            ids: data?.content?.brand?.brand_ids?.join(','),
          }),
        );
      } else {
        getBrands$ = of(null);
      }

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body');
        forkJoin([getProducts$, getCategory$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  ngOnChanges(change: SimpleChanges) {
    this.banners = change['data']?.currentValue?.content?.offer_banner?.banners.filter(
      (banner: IBanners) => {
        return banner.status;
      },
    );
  }
}
