import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { IFeaturedBanner, IYoga } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBlog } from '../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-yoga',
  imports: [ImageLink, ThemeTitle, ThemeProduct, ThemeBlog, ThemeSocialMedia, ThemeBrand, NgClass],
  templateUrl: './yoga.html',
  styleUrl: './yoga.scss',
})
export class Yoga {
  private store = inject(Store);
  themeOptionService = inject(ThemeOptionService);

  readonly data = input<IYoga>();
  readonly slug = input<string>();
  private platformId: boolean;
  public banners: IFeaturedBanner[];
  public banners2: IFeaturedBanner[];

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

      this.banners2 = [];
      if (data?.content?.offer_banner_2?.banner_1?.status) {
        this.banners2 = [...this.banners2, data?.content?.offer_banner_2?.banner_1];
      }
      if (data?.content?.offer_banner_2?.banner_2?.status) {
        this.banners2 = [...this.banners2, data?.content?.offer_banner_2?.banner_2];
      }
      if (data?.content?.offer_banner_2?.banner_3?.status) {
        this.banners2 = [...this.banners2, data?.content?.offer_banner_2?.banner_3];
      }

      // Get Products
      let getProduct$;
      if (data?.content?.products_ids.length) {
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

      if (this.platformId) {
        forkJoin([getProduct$, getBlog$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
