import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { IFeaturedBanner, IMarketplaceThree } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBanner } from '../../widgets/theme-banner/theme-banner';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-marketplace-3',
  imports: [
    ThemeHomeSlider,
    ThemeBanner,
    Categories,
    ThemeProduct,
    ImageLink,
    ThemeTitle,
    ThemeProductTabSection,
    ThemeBlog,
    ThemeBrand,
  ],
  templateUrl: './marketplace-3.html',
  styleUrl: './marketplace-3.scss',
})
export class Marketplace3 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IMarketplaceThree>();
  readonly slug = input<string>();
  public banners: IFeaturedBanner[];
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      let categoryIds = data?.content?.categories_products?.left_panel?.categories?.category_ids;

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
      if (categoryIds?.length) {
        getCategory$ = this.store.dispatch(
          new GetCategoriesAction({
            status: 1,
            ids: categoryIds?.join(','),
          }),
        );
      } else {
        getCategory$ = of(null);
      }

      // Get Blog
      let getBlogs$;
      if (data?.content?.featured_blogs.blog_ids.length && data?.content?.featured_blogs?.status) {
        getBlogs$ = this.store.dispatch(
          new GetBlogsAction({
            status: 1,
            ids: data?.content.featured_blogs.blog_ids?.join(','),
          }),
        );
      } else {
        getBlogs$ = of(null);
      }

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.brand_ids.length && data?.content?.brand?.status) {
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

        forkJoin([getProduct$, getCategory$, getBlogs$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
