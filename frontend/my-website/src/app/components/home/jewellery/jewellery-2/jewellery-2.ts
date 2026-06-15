import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { Categories } from '../../../../shared/components/widgets/categories/categories';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { JewelleryCategorySlider, categorySlider } from '../../../../shared/data/owl-carousel';
import { ICategory } from '../../../../shared/interface/category.interface';
import { IBanners, IJewelryTwo } from '../../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../../shared/store/action/brand.action';
import { GetCategoriesAction } from '../../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../../shared/store/action/product.action';
import { ThemeBanner } from '../../widgets/theme-banner/theme-banner';
import { ThemeBrand } from '../../widgets/theme-brand/theme-brand';
import { ThemeHomeSlider } from '../../widgets/theme-home-slider/theme-home-slider';
import { ThemeProduct } from '../../widgets/theme-product/theme-product';
import { ThemeServices } from '../../widgets/theme-services/theme-services';
import { ThemeSocialMedia } from '../../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../../widgets/theme-title/theme-title';

@Component({
  selector: 'app-jewellery-2',
  imports: [
    CarouselModule,
    ThemeHomeSlider,
    ThemeBanner,
    ThemeTitle,
    ThemeProduct,
    ThemeServices,
    ThemeSocialMedia,
    ThemeBrand,
    Categories,
    ImageLink,
    NgClass,
  ],
  templateUrl: './jewellery-2.html',
  styleUrl: './jewellery-2.scss',
})
export class Jewellery2 {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IJewelryTwo>();
  readonly slug = input<string>();
  private platformId: boolean;
  public categories: ICategory[];
  public categories2: ICategory[];
  public options = categorySlider;
  public categorySlider = JewelleryCategorySlider;
  public filteredBanners: IBanners[];
  public StorageURL = environment.storageURL;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      let categoryIds = data?.content.categories.category_ids;

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
      if (categoryIds && categoryIds.length) {
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
        forkJoin([getProduct$, getCategory$, getBrands$]).subscribe({
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
    }
  }
}
