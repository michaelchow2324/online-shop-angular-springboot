import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { categorySlider } from '../../../shared/data/owl-carousel';
import { ICategory } from '../../../shared/interface/category.interface';
import { IBanners, IMedical } from '../../../shared/interface/theme.interface';
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
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-medical',
  imports: [
    ThemeHomeSlider,
    CarouselModule,
    Categories,
    ThemeTitle,
    ThemeProductTabSection,
    ThemeProduct,
    ThemeBlog,
    ThemeServices,
    ThemeBrand,
    ImageLink,
    NgClass,
  ],
  templateUrl: './medical.html',
  styleUrl: './medical.scss',
})
export class Medical {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IMedical>();
  readonly slug = input<string>();
  private platformId: boolean;
  public categories: ICategory[];
  public options = categorySlider;
  public filteredBanners: IBanners[];

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      let category = [
        ...new Set(
          data?.content.categories.category_ids.concat(data.content.category_product.category_ids),
        ),
      ];

      // Get Products
      let getProducts$;
      if (
        data?.content?.products_ids.length &&
        (data?.content?.column_banner_product?.product_list_1?.status ||
          data?.content?.column_banner_product?.product_list_2?.status)
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

      // Get Category
      let getCategory$;
      if (
        category.length &&
        (data?.content?.categories?.status || data?.content?.category_product?.status)
      ) {
        getCategory$ = this.store.dispatch(
          new GetCategoriesAction({
            status: 1,
            ids: category?.join(','),
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
        forkJoin([getProducts$, getCategory$, getBrands$, getBlog$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
    if (this.platformId) {
      document.body.classList.add('theme-color-22');
    }
    this.themeOptionService.theme_color = '#38c6bb';
  }

  ngOnChanges(change: SimpleChanges) {
    this.filteredBanners = change['data']?.currentValue?.content?.offer_banner?.banners?.filter(
      (banner: IBanners) => {
        return banner.status;
      },
    );
  }
  ngOnDestroy() {
    // Remove Class
    if (this.platformId) {
      document.body.classList.remove('theme-color-22');
    }
  }
}
