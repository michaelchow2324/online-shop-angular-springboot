import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, SimpleChanges, inject, input } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Button } from '../../../shared/components/widgets/button/button';
import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { VideoModal } from '../../../shared/components/widgets/modal/video-modal/video-modal';
import { productSlider4, toolsCategorySlider } from '../../../shared/data/owl-carousel';
import { ICategory } from '../../../shared/interface/category.interface';
import {
  IBanners,
  IFeaturedBanner,
  ISingleProduct,
  ITestimonialBanner,
} from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBrandsAction } from '../../../shared/store/action/brand.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBrand } from '../widgets/theme-brand/theme-brand';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeSocialMedia } from '../widgets/theme-social-media/theme-social-media';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-single-product',
  imports: [ImageLink, ThemeTitle, ThemeProduct, ThemeSocialMedia, ThemeBrand, Button],
  templateUrl: './single-product.html',
  styleUrl: './single-product.scss',
})
export class SingleProduct {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);
  private modal = inject(NgbModal);

  readonly data = input<ISingleProduct>();
  readonly slug = input<string>();
  private platformId: boolean;

  public category: ICategory[];
  public banners: IFeaturedBanner[];
  public options = toolsCategorySlider;
  public productSlider4 = productSlider4;
  public filteredServices: IBanners[];
  public filteredTestimonial: ITestimonialBanner[];
  public singleProductIds: number[] = [];
  public StorageURL = environment.storageURL;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnChanges(change: SimpleChanges) {
    const data = this.data();
    if (data?.slug == this.slug()) {
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
        forkJoin([getProducts$, getBrands$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }

      this.filteredServices = change[
        'data'
      ]?.currentValue?.content?.services?.right_panel?.banners?.filter((banner: IBanners) => {
        return banner.status;
      });

      this.filteredTestimonial = change[
        'data'
      ]?.currentValue?.content?.testimonial?.banners?.filter((banner: IBanners) => {
        return banner.status;
      });

      const productId = data?.content?.single_product?.product_ids;
      this.singleProductIds = Array.isArray(productId)
        ? productId
        : productId !== undefined
          ? [productId]
          : [];
    }
  }

  ngOnInit() {
    if (this.platformId) {
      document.body.classList.add('single-product');
    }
  }

  getText(value: string) {
    const text = value.split(' ');

    const firstWord = text.slice(0, 3).join(' ');
    const remainingWord = text.slice(3).join(' ');
    return `<h1>${firstWord} <span>${remainingWord}</span></h1>`;
  }

  openModal(url: string, type: string) {
    const modal = this.modal.open(VideoModal, {
      centered: true,
      size: 'lg',
      windowClass: 'theme-modal-2',
    });
    modal.componentInstance.video_url = url;
    modal.componentInstance.type = type;
  }

  ngOnDestroy() {
    if (this.platformId) {
      document.body.classList.remove('single-product');
    }
  }
}
