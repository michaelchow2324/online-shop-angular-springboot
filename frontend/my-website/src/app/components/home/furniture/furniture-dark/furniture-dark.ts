import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { FurnitureCategorySlider } from '../../../../shared/data/owl-carousel';
import { ICategory } from '../../../../shared/interface/category.interface';
import { IFurnitureDark } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBlog } from '../../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-furniture-dark',
  imports: [
    CarouselModule,
    ThemeHomeSlider,
    ThemeTitle,
    ThemeProduct,
    ImageLink,
    ThemeServices,
    ThemeBlog,
    ThemeBrand,
    Categories,
  ],
  templateUrl: './furniture-dark.html',
  styleUrl: './furniture-dark.scss',
})
export class FurnitureDark {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IFurnitureDark>();
  readonly slug = input<string>();
  private platformId: boolean;

  public categories: ICategory[];
  public categoryOptions = FurnitureCategorySlider;
  public StorageURL = environment.storageURL;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      // Get Products
      const getProduct$ = this.store.dispatch(
        new GetProductByIdsAction({
          status: 1,
          approve: 1,
          ids: data?.content?.products_ids?.join(','),
          paginate: data?.content?.products_ids?.length,
        }),
      );
      // Get Category
      const getCategory$ = this.store.dispatch(
        new GetCategoriesAction({
          status: 1,
          ids: data?.content.categories_icon_list.category_ids?.join(','),
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

      // Get Brand
      const getBrands$ = this.store.dispatch(
        new GetBrandsAction({
          status: 1,
          ids: data?.content?.brand?.brand_ids?.join(','),
        }),
      );

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body');
        document.body.classList.add('dark');
        document.body.classList.add('dark-demo');

        forkJoin([getProduct$, getCategory$, getBrands$, getBlog$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  ngOnDestroy() {
    // Remove Class
    if (this.platformId) {
      document.body.classList.remove('dark');
      document.body.classList.remove('dark-demo');
    }
  }
}
