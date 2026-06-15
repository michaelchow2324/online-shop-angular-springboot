import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { IKids } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeFourColumnProduct } from '../widgets/theme-four-column-product/theme-four-column-product';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-kids',
  imports: [
    ThemeHomeSlider,
    ThemeTitle,
    ThemeProduct,
    ThemeFourColumnProduct,
    ThemeSocialMedia,
    ThemeBrand,
    ImageLink,
  ],
  templateUrl: './kids.html',
  styleUrl: './kids.scss',
})
export class Kids {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IKids>();
  readonly slug = input<string>();
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      // Get Products
      let getProducts$;
      if (
        data?.content?.products_ids?.length &&
        (data?.content?.products_list?.status || data?.content?.slider_products?.status)
      ) {
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
        forkJoin([getProducts$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
