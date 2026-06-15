import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { JewelleryCategorySlider, categorySlider } from '../../../../shared/data/owl-carousel';
import { ICategory } from '../../../../shared/interface/category.interface';
import { IJewelryOne } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeSocialMedia } from '../../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-jewellery-1',
  imports: [
    ThemeHomeSlider,
    Categories,
    ThemeTitle,
    ThemeProduct,
    ThemeServices,
    ThemeProductTabSection,
    ThemeSocialMedia,
    ThemeBrand,
    ImageLink,
  ],
  templateUrl: './jewellery-1.html',
  styleUrl: './jewellery-1.scss',
})
export class Jewellery1 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  private platformId: boolean;
  readonly data = input<IJewelryOne>();
  readonly slug = input<string>();
  public categories: ICategory[];
  public categories2: ICategory[];
  public options = categorySlider;
  public categorySlider = JewelleryCategorySlider;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      let categoryIds = data?.content.categories.category_ids.concat(
        data?.content.category_product.category_ids,
      );
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

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.brand_ids.length) {
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
        document.body.classList.add('bg_cls');
        forkJoin([getProduct$, getCategory$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  ngOnDestroy() {
    if (this.platformId) {
      document.body.classList.remove('bg_cls');
    }
  }
}
