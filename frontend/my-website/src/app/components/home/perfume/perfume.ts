import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Button } from '../../../shared/components/widgets/button/button';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { productSlider } from '../../../shared/data/owl-carousel';
import { IFeaturedBanner, IPerfume } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-perfume',
  imports: [
    ThemeTitle,
    ThemeProductTabSection,
    ThemeProduct,
    ThemeBrand,
    ImageLink,
    Button,
    NgClass,
  ],
  templateUrl: './perfume.html',
  styleUrl: './perfume.scss',
})
export class Perfume {
  private store = inject(Store);
  themeOptionService = inject(ThemeOptionService);

  readonly data = input<IPerfume>();
  readonly slug = input<string>();
  private platformId: boolean;
  public options = productSlider;
  public banners: IFeaturedBanner[];
  public StorageURL = environment.storageURL;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      this.banners = [];
      if (data?.content?.offer_banner_1?.banner_1?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_1];
      }
      if (data?.content?.offer_banner_1?.banner_2?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_2];
      }
      if (data?.content?.offer_banner_1?.banner_3?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_3];
      }
      if (data?.content?.offer_banner_1?.banner_4?.status) {
        this.banners = [...this.banners, data?.content?.offer_banner_1?.banner_4];
      }

      // Get Products
      let getProduct$;
      if (data?.content?.products_ids.length && data?.content?.product_list?.status) {
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
        data?.content.category_product.category_ids.length &&
        data?.content?.category_product?.status
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
      if (data?.content?.brand?.brand_ids.length && data?.content?.brand.status) {
        getBrands$ = this.store.dispatch(
          new GetBrandsAction({
            status: 1,
            ids: data?.content?.brand?.brand_ids?.join(','),
          }),
        );
      } else {
        getBrands$ = of(null);
      }

      if (this.platformId) {
        forkJoin([getProduct$, getCategory$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }
}
