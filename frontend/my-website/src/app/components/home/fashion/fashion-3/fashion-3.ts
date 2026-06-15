import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { forkJoin, of } from 'rxjs';

import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { productSlider4 } from '../../../../shared/data/owl-carousel';
import { IFashionThree } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-fashion-3',
  imports: [
    ThemeHomeSlider,
    ThemeTitle,
    ThemeProduct,
    ThemeProductTabSection,
    ThemeBrand,
    ImageLink,
  ],
  templateUrl: './fashion-3.html',
  styleUrl: './fashion-3.scss',
})
export class Fashion3 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IFashionThree>();
  readonly slug = input<string>();

  public productSlider4 = productSlider4;
  public productSlider: OwlOptions = {
    loop: true,
    nav: false,
    dots: false,
    margin: 24,
    items: 4,
    responsive: {
      0: {
        items: 2,
        margin: 16,
      },
      576: {
        items: 3,
      },
      915: {
        items: 4,
      },
    },
  };
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      // Get Products
      let getProduct$;
      if (data?.content?.products_ids.length && data?.content?.products_list?.status) {
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
      if (data?.content?.brand?.status && data?.content?.brand?.brand_ids?.length) {
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
        document.body.classList.add('box-layout-body');

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
    // Remove Class
    if (this.platformId) {
      document.body.classList.remove('box-layout-body');
    }
  }
}
