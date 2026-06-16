import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { IFeaturedBanner, IMarketplaceTwo } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeFourColumnProduct } from '../../widgets/theme-four-column-product/theme-four-column-product';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-marketplace-2',
  imports: [
    ThemeHomeSlider,
    ThemeProduct,
    ThemeTitle,
    ThemeFourColumnProduct,
    ThemeServices,
    ImageLink,
    ThemeBrand,
    NgClass,
  ],
  templateUrl: './marketplace-2.html',
  styleUrl: './marketplace-2.scss',
})
export class Marketplace2 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IMarketplaceTwo>();
  readonly slug = input<string>();
  private platformId: boolean;
  public banners: IFeaturedBanner[];

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
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
      if (data?.content?.offer_banner_1?.banner_4?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_4];
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

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.status && data?.content?.brand?.brand_ids) {
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

        // color header class
        document.body.classList.add('header-theme-color');

        forkJoin([getProduct$, getBrands$]).subscribe({
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
      document.body.classList.remove('header-theme-color');
    }
  }
}
