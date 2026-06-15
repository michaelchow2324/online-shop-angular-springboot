import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, inject, PLATFORM_ID, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { forkJoin, Observable, of } from 'rxjs';

import { Categories } from '../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { attributeSlider } from '../../../shared/data/owl-carousel';
import { IAttribute } from '../../../shared/interface/attribute.interface';
import { IShoes } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetAttributeAction } from '../../../shared/store/action/attribute.action';
import { GetBlogsAction } from '../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { AttributeState } from '../../../shared/store/state/attribute.state';
import { ThemeBlog } from '../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeFourColumnProduct } from '../widgets/theme-four-column-product/theme-four-column-product';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeServices } from '../widgets/theme-services/theme-services';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-shoes',
  imports: [
    RouterModule,
    ThemeHomeSlider,
    Categories,
    ThemeTitle,
    ThemeProduct,
    ThemeFourColumnProduct,
    ThemeProductTabSection,
    ThemeBlog,
    ThemeServices,
    ThemeSocialMedia,
    ThemeBrand,
    ImageLink,
    CarouselModule,
    NgClass,
  ],
  templateUrl: './shoes.html',
  styleUrl: './shoes.scss',
})
export class Shoes {
  private store = inject(Store);
  private router = inject(Router);
  themeOptionService = inject(ThemeOptionService);

  readonly data = input<IShoes>();
  readonly slug = input<string>();

  attribute_value$: Observable<IAttribute> = inject(Store).select(
    AttributeState.selectedAttribute,
  ) as Observable<IAttribute>;

  public attribute_value: IAttribute;
  public attributeSliderOptions = attributeSlider;
  private platformId: boolean;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
    this.attribute_value$.subscribe(value => {
      this.attribute_value = value;
    });
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      let categoryIds = [
        ...new Set(
          data?.content.categories_1.category_ids.concat(
            data?.content.categories_2.category_ids,
            data?.content?.category_product.category_ids,
          ),
        ),
      ];

      // Get Products
      let getProducts$;
      if (
        data?.content?.products_ids.length &&
        (data?.content?.products_list?.status || data?.content?.slider_products?.status)
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
        (data?.content?.categories_1?.status ||
          data?.content?.categories_2?.status ||
          data?.content?.category_product.status)
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

      // Get Attribute
      let getAttribute$;
      if (data?.content.attribute.attribute_id) {
        getAttribute$ = this.store.dispatch(
          new GetAttributeAction(data?.content.attribute.attribute_id),
        );
      } else {
        getAttribute$ = of(null);
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
        forkJoin([getProducts$, getCategory$, getAttribute$, getBlog$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  getAttribute(value: string) {
    void this.router.navigate(['/collections'], { queryParams: { attribute: value } });
  }
}
