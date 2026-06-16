import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { IElectronicTwo, IFeaturedBanner } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeProductTabSection } from '../../widgets/theme-product-tab-section/theme-product-tab-section';

@Component({
  selector: 'app-electronic-2',
  imports: [ThemeProductTabSection, ThemeBrand, ImageLink],
  templateUrl: './electronic-2.html',
  styleUrl: './electronic-2.scss',
})
export class Electronic2 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IElectronicTwo>();
  readonly slug = input<string>();

  public banners: IFeaturedBanner[];
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.banners = [];
      if (data?.content?.offer_banner?.banner_1?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner?.banner_1];
      }
      if (data?.content?.offer_banner?.banner_2?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner?.banner_2];
      }
      if (data?.content?.offer_banner?.banner_3?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner?.banner_3];
      }

      // Get Products
      let getProduct$;
      if (data?.content?.products_ids?.length) {
        getProduct$ = this.store.dispatch(
          new GetProductByIdsAction({
            status: 1,
            approve: 1,
            ids: data?.content?.products_ids?.join(','),
            paginate: data?.content?.products_ids?.length,
          }),
        );
      } else {
        getProduct$ = of(null);
      }

      // Get Category
      let getCategory$;
      if (
        data?.content.category_product?.status &&
        data?.content.category_product.category_ids?.length
      ) {
        getCategory$ = this.store.dispatch(
          new GetCategoriesAction({
            status: 1,
            ids: data?.content.category_product.category_ids?.join(','),
          }),
        );
      } else {
        getCategory$ = of(null);
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

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body');
        forkJoin([getProduct$, getCategory$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
