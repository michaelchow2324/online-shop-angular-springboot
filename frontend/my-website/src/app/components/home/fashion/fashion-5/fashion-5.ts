import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin } from 'rxjs';

import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { SocialMediaSlider, productSlider } from '../../../../shared/data/owl-carousel';
import { ICategory } from '../../../../shared/interface/category.interface';
import { IFashionFive } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeProductTabSection } from '../../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeSocialMedia } from '../../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-fashion-5',
  imports: [
    ImageLink,
    ThemeTitle,
    ThemeSocialMedia,
    ThemeBrand,
    Categories,
    ThemeProductTabSection,
  ],
  templateUrl: './fashion-5.html',
  styleUrl: './fashion-5.scss',
})
export class Fashion5 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IFashionFive>();
  readonly slug = input<string>();

  public categories: ICategory[];
  public options = productSlider;
  public SocialMediaSlider = SocialMediaSlider;
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.options = {
        ...this.options,
        responsive: {
          0: {
            items: 2,
            mouseDrag: true,
          },
          890: {
            items: 3,
            mouseDrag: true,
          },
          999: {
            items: 4,
            mouseDrag: false,
            touchDrag: false,
          },
        },
      };

      this.SocialMediaSlider = {
        ...this.SocialMediaSlider,
        center: true,
        responsive: {
          ...this.SocialMediaSlider.responsive,
          1367: {
            items: 5,
          },
        },
      };

      let categoryIds = data?.content.categories?.category_ids.concat(
        data?.content.category_product?.category_ids,
      );

      // Get Products
      const getProducts$ = this.store.dispatch(
        new GetProductByIdsAction({
          status: 1,
          is_approved: 1,
          ids: data?.content.products_ids?.join(','),
          paginate: data?.content?.products_ids?.length,
        }),
      );

      // Get Category
      const getCategory$ = this.store.dispatch(
        new GetCategoriesAction({
          status: 1,
          ids: categoryIds?.join(','),
        }),
      );

      // Get Brand
      const getBrands$ = this.store.dispatch(
        new GetBrandsAction({
          status: 1,
          ids: data?.content?.brand?.brand_ids?.join(','),
        }),
      );

      if (this.platformId) {
        // Skeleton Loader
        document.body.classList.add('skeleton-body');

        forkJoin([getProducts$, getCategory$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
