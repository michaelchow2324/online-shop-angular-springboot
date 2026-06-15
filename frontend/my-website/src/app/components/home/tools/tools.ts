import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Categories } from '../../../shared/components/widgets/categories/categories';
import { productSlider, toolsCategorySlider } from '../../../shared/data/owl-carousel';
import { ITools } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeServices } from '../widgets/theme-services/theme-services';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-tools',
  imports: [
    ThemeHomeSlider,
    ThemeServices,
    ThemeTitle,
    Categories,
    ThemeProduct,
    ThemeProductTabSection,
    ThemeBrand,
    NgClass,
  ],
  templateUrl: './tools.html',
  styleUrl: './tools.scss',
})
export class Tools {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<ITools>();
  readonly slug = input<string>();
  private platformId: boolean;
  public options = toolsCategorySlider;
  public productSlider = productSlider;
  public StorageURL = environment.storageURL;
  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      let categoryIds = [
        ...new Set(
          data?.content.categories.category_ids.concat(
            data.content.category_product.right_panel.product_category.category_ids,
          ),
        ),
      ];

      this.productSlider = {
        ...this.productSlider,
        responsive: {
          ...this.productSlider.responsive,
          999: {
            items: 5,
          },
        },
      };

      // Get Products
      let getProducts$;
      if (
        data?.content?.products_ids.length &&
        (data?.content?.products_list_1?.status ||
          data?.content?.products_list_2?.status ||
          data?.content?.category_product?.left_panel?.status)
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
        categoryIds.length &&
        (data?.content.categories.category_ids ||
          data?.content.category_product.right_panel.product_category.category_ids)
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
        document.body.classList.add('tools-bg');
        forkJoin([getProducts$, getCategory$, getBrands$]).subscribe({
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
      document.body.classList.remove('tools-bg');
    }
  }
}
