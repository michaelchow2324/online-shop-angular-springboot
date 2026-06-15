import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { IFashionOne } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeSocialMedia } from '../../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-fashion-1',
  providers: [Store],
  imports: [
    ThemeHomeSlider,
    ThemeTitle,
    ThemeProduct,
    ThemeProductTabSection,
    ThemeServices,
    ThemeBlog,
    ThemeBlog,
    ThemeSocialMedia,
    ThemeBrand,
    ImageLink,
    NgClass,
  ],
  templateUrl: './fashion-1.html',
  styleUrl: './fashion-1.scss',
})
export class Fashion1 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IFashionOne>();
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
      if (data?.content?.products_ids?.length && data?.content?.products_list?.status) {
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
      if (
        data?.content.category_product.category_ids?.length &&
        data?.content.category_product?.status
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

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body');

        forkJoin([getProducts$, getCategory$, getBrands$, getBlog$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
