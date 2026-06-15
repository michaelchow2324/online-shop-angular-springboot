import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { productSlider } from '../../../../shared/data/owl-carousel';
import { IProduct } from '../../../../shared/interface/product.interface';
import { IVegetablesOne } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-vegetables-1',
  imports: [
    ThemeHomeSlider,
    ThemeServices,
    ThemeTitle,
    ThemeProduct,
    ThemeBlog,
    ThemeBrand,
    ImageLink,
  ],
  templateUrl: './vegetables-1.html',
  styleUrl: './vegetables-1.scss',
})
export class Vegetables1 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IVegetablesOne>();
  readonly slug = input<string>();
  private platformId: boolean;
  public options = productSlider;
  public product: IProduct[];

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
          ...this.options.responsive,
          999: {
            items: 5,
          },
        },
      };

      // Get Products
      let getProducts$;
      if (data?.content?.products_ids?.length) {
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
      if (data?.content?.brand.status && data?.content?.brand?.brand_ids?.length) {
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
