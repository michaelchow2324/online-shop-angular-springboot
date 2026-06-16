import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import * as data from '../../../../shared/data/owl-carousel';
import { IBanners, IVegetablesFour } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-vegetables-4',
  imports: [
    ImageLink,
    Categories,
    ThemeTitle,
    ThemeProduct,
    ThemeServices,
    ThemeBlog,
    ThemeBrand,
    NgClass,
  ],
  templateUrl: './vegetables-4.html',
  styleUrl: './vegetables-4.scss',
})
export class Vegetables4 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IVegetablesFour>();
  readonly slug = input<string>();
  private platformId: boolean;
  public filteredBanners: IBanners[];
  public filteredBanners2: IBanners[];
  public productSlider6 = data.productSlider6;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const dataValue = this.data();
    if (dataValue?.slug == this.slug()) {
      // Get Products
      let getProduct$;
      if (dataValue?.content?.products_ids?.length) {
        getProduct$ = this.store.dispatch(
          new GetProductByIdsAction({
            status: 1,
            approve: 1,
            ids: dataValue?.content?.products_ids?.join(','),
            paginate: dataValue?.content?.products_ids?.length,
          }),
        );
      } else {
        getProduct$ = of(null);
      }

      // Get Category
      let getCategory$;
      if (
        dataValue?.content.categories.category_ids?.length &&
        dataValue?.content.categories?.status
      ) {
        getCategory$ = this.store.dispatch(
          new GetCategoriesAction({
            status: 1,
            ids: dataValue?.content.categories.category_ids?.join(','),
          }),
        );
      } else {
        getCategory$ = of(null);
      }

      // Get Blog
      let getBlogs$;
      if (
        dataValue?.content?.featured_blogs.blog_ids.length &&
        dataValue?.content?.featured_blogs?.status
      ) {
        getBlogs$ = this.store.dispatch(
          new GetBlogsAction({
            status: 1,
            ids: dataValue?.content.featured_blogs.blog_ids?.join(','),
          }),
        );
      } else {
        getBlogs$ = of(null);
      }

      // Get Brand
      let getBrands$;
      if (dataValue?.content?.brand?.brand_ids.length && dataValue?.content?.brand?.status) {
        getBrands$ = this.store.dispatch(
          new GetBrandsAction({
            status: 1,
            ids: dataValue?.content?.brand?.brand_ids?.join(','),
          }),
        );
      } else {
        getBrands$ = of(null);
      }

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body');
        document.body.classList.add('mulish-font');

        forkJoin([getProduct$, getBlogs$, getBrands$, getCategory$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['data'] && change['data'].currentValue) {
      this.filteredBanners = change['data']?.currentValue?.content?.offer_banner_1?.banners?.filter(
        (banner: IBanners) => {
          return banner.status;
        },
      );

      this.filteredBanners2 = change[
        'data'
      ]?.currentValue?.content?.offer_banner_2?.banners?.filter((banner: IBanners) => {
        return banner.status;
      });
    }
  }

  ngOnDestroy() {
    if (this.platformId) {
      document.body.classList.remove('mulish-font');
    }
  }
}
