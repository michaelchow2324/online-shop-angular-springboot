import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { productSlider4, toolsCategorySlider } from '../../../shared/data/owl-carousel';
import { ICategory } from '../../../shared/interface/category.interface';
import { IFeaturedBanner, IWatch } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBlog } from '../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeServices } from '../widgets/theme-services/theme-services';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-watch',
  imports: [
    ThemeHomeSlider,
    ThemeBrand,
    ImageLink,
    Categories,
    ThemeTitle,
    ThemeProductTabSection,
    ThemeProduct,
    ThemeBlog,
    ThemeServices,
    ThemeSocialMedia,
    NgClass,
  ],
  templateUrl: './watch.html',
  styleUrl: './watch.scss',
})
export class Watch {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IWatch>();
  readonly slug = input<string>();
  private platformId: boolean;
  public category: ICategory[];
  public banners: IFeaturedBanner[];
  public options = toolsCategorySlider;
  public productSlider4 = productSlider4;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.banners = [];
      if (data?.content?.offer_banner_2?.banner_1?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_2?.banner_1];
      }
      if (data?.content?.offer_banner_2?.banner_2?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_2?.banner_2];
      }
      if (data?.content?.offer_banner_2?.banner_3?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_2?.banner_3];
      }

      let categoryIds = [
        ...new Set(
          data?.content?.categories?.category_ids.concat(
            data.content.category_product.category_ids,
          ),
        ),
      ];

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

      // Get Category
      let getCategory$;
      if (
        categoryIds.length &&
        (data?.content?.category_product?.status || data?.content?.categories?.status)
      ) {
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
        forkJoin([getProduct$, getCategory$, getBlog$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
