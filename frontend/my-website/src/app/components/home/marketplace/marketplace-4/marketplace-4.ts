import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { IMarketplaceFour } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBanner } from '../../widgets/theme-banner/theme-banner';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeSocialMedia } from '../../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-marketplace-4',
  imports: [
    ThemeHomeSlider,
    ThemeServices,
    ThemeTitle,
    ThemeProduct,
    ImageLink,
    ThemeBanner,
    ThemeBrand,
    ThemeSocialMedia,
    NgClass,
  ],
  templateUrl: './marketplace-4.html',
  styleUrl: './marketplace-4.scss',
})
export class Marketplace4 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IMarketplaceFour>();
  readonly slug = input<string>();
  private platformId: boolean;
  public StorageURL = environment.storageURL;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
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
