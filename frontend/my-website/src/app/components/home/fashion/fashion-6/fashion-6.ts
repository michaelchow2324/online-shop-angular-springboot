import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { productSlider } from '../../../../shared/data/owl-carousel';
import { IFashionSix } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeSocialMedia } from '../../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-fashion-6',
  imports: [
    ThemeHomeSlider,
    ImageLink,
    ThemeTitle,
    ThemeProduct,
    ThemeBlog,
    ThemeSocialMedia,
    ThemeBrand,
    NgClass,
  ],
  templateUrl: './fashion-6.html',
  styleUrl: './fashion-6.scss',
})
export class Fashion6 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IFashionSix>();
  readonly slug = input<string>();

  public options = productSlider;
  public StorageURL = environment.storageURL;
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
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

      // Get Brand
      const getBrands$ = this.store.dispatch(
        new GetBrandsAction({
          status: 1,
          ids: data?.content?.brand?.brand_ids?.join(','),
        }),
      );

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

      if (this.platformId) {
        // Skeleton Loader
        document.body.classList.add('skeleton-body');

        forkJoin([getProducts$, getBrands$, getBlog$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
