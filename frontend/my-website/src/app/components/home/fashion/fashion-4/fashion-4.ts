import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { productSlider4 } from '../../../../shared/data/owl-carousel';
import { ICategory } from '../../../../shared/interface/category.interface';
import { IFashionFour, IFeaturedBanner } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-fashion-4',
  imports: [ThemeHomeSlider, ThemeTitle, ThemeProduct, ImageLink, ThemeBrand, Categories, NgClass],
  templateUrl: './fashion-4.html',
  styleUrl: './fashion-4.scss',
})
export class Fashion4 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IFashionFour>();
  readonly slug = input<string>();

  public categories: ICategory[];
  public banners: IFeaturedBanner[];
  public productSlider4 = productSlider4;
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.banners = [];
      if (data?.content?.offer_banner_1?.banner_1?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_1];
      }
      if (data?.content?.offer_banner_1?.banner_2?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_2];
      }
      if (data?.content?.offer_banner_1?.banner_3?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_3];
      }

      let categoryIds = data?.content?.products_list?.categories?.category_ids;

      // Get Products
      let getProducts$;
      if (data?.content?.products_ids?.length && data?.content?.products_list?.products?.status) {
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

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.status && data?.content?.brand?.brand_ids?.length) {
        getBrands$ = this.store.dispatch(
          new GetBrandsAction({
            status: 1,
            ids: data?.content?.brand?.brand_ids?.join(','),
          }),
        );
      } else {
        getBrands$ = of(null);
      }

      // Get Category
      this.store.dispatch(
        new GetCategoriesAction({
          status: 1,
          ids: categoryIds?.join(','),
        }),
      );

      if (this.platformId) {
        // Skeleton Loader
        document.body.classList.add('skeleton-body');

        // large container
        document.body.classList.add('large-container');

        forkJoin([getProducts$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  ngOnDestroy() {
    if (this.platformId) {
      document.body.classList.remove('large-container');
    }
  }
}
