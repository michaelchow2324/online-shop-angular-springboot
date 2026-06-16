import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { IBanners, IPets } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBlog } from '../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-pets',
  imports: [ThemeHomeSlider, ThemeBrand, ImageLink, ThemeTitle, ThemeProduct, ThemeBlog, NgClass],
  templateUrl: './pets.html',
  styleUrl: './pets.scss',
})
export class Pets {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IPets>();
  readonly slug = input<string>();
  private platformId: boolean;
  public filteredBanners: IBanners[];
  public StorageURL = environment.storageURL;

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
        data?.content?.products_ids.length &&
        (data?.content?.products_list_1?.status || data?.content?.products_list_2?.status)
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

      // Get Blog
      let getBlog$;
      if (
        data?.content?.featured_blogs?.blog_ids?.length &&
        data?.content?.featured_blogs?.status
      ) {
        getBlog$ = this.store.dispatch(
          new GetBlogsAction({
            status: 1,
            ids: data?.content?.featured_blogs?.blog_ids?.join(','),
          }),
        );
      } else {
        getBlog$ = of(null);
      }

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.brand_ids.length && data?.content?.brand.status) {
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
        forkJoin([getProducts$, getBlog$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }

    // header light
    if (this.platformId) {
      document.body.classList.add('header-style-light');
    }
  }

  ngOnChanges(change: SimpleChanges) {
    this.filteredBanners = change['data']?.currentValue?.content?.offer_banner?.banners.filter(
      (banner: IBanners) => {
        return banner.status;
      },
    );
  }

  ngOnDestroy() {
    if (this.platformId) {
      document.body.classList.remove('header-style-light');
    }
  }
}
