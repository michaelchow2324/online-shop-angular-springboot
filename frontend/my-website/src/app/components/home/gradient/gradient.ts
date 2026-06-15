import { isPlatformBrowser, AsyncPipe, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, forkJoin, of } from 'rxjs';

import { Categories } from '../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { blogSlider4, productSlider5 } from '../../../shared/data/owl-carousel';
import { ICouponModel } from '../../../shared/interface/coupon.interface';
import { IBanners, IGradient } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../shared/store/action/blog.action';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetCouponsAction } from '../../../shared/store/action/coupon.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { CouponState } from '../../../shared/store/state/coupon.state';
import { ThemeBlog } from '../widgets/theme-blog/theme-blog';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../widgets/theme-home-slider/theme-home-slider';
import { ThemeParallaxBanner } from '../widgets/theme-parallax-banner/theme-parallax-banner';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-gradient',
  imports: [
    CarouselModule,
    ThemeHomeSlider,
    Categories,
    ImageLink,
    ThemeTitle,
    ThemeProductTabSection,
    ThemeProduct,
    ThemeParallaxBanner,
    ThemeBlog,
    ThemeSocialMedia,
    ThemeBrand,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './gradient.html',
  styleUrl: './gradient.scss',
})
export class Gradient {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IGradient>();
  readonly slug = input<string>();
  private platformId: boolean;

  coupon$: Observable<ICouponModel> = inject(Store).select(CouponState.coupon);

  public productSlider5 = productSlider5;
  public blogSlider4 = blogSlider4;

  public images = [
    'assets/images/gradient/deal-bg/1.jpg',
    'assets/images/gradient/deal-bg/2.jpg',
    'assets/images/gradient/deal-bg/3.jpg',
    'assets/images/gradient/deal-bg/4.jpg',
    'assets/images/gradient/deal-bg/5.jpg',
    'assets/images/gradient/deal-bg/6.jpg',
  ];

  public options: OwlOptions = {
    loop: true,
    nav: false,
    dots: false,
    margin: 24,
    responsive: {
      0: {
        items: 2,
        margin: 12,
      },
      600: {
        items: 3,
        margin: 12,
      },
      700: {
        items: 4,
      },
      1050: {
        items: 5,
      },
      1296: {
        items: 6,
      },
    },
  };

  public filteredBanners: IBanners[];

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.store.dispatch(new GetCouponsAction({ status: 1 }));

      let categoryIds = data?.content?.category_product?.category_ids.concat(
        data?.content?.categories_1?.category_ids,
      );

      // Get Products
      let getProducts$;
      if (data?.content?.products_ids?.length) {
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

      // Get Brand
      let getBrands$;
      if (data?.content?.brand?.brand_ids?.length && data?.content?.brand?.status) {
        getBrands$ = this.store.dispatch(
          new GetBrandsAction({
            status: 1,
            ids: data?.content?.brand?.brand_ids?.join(','),
          }),
        );
      } else {
        getBrands$ = of(null);
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
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['data'] && change['data'].currentValue) {
      this.filteredBanners = change['data']?.currentValue?.content?.offer_banner?.banners?.filter(
        (banner: IBanners) => {
          return banner.status;
        },
      );
    }
  }
}
