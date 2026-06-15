import { isPlatformBrowser, AsyncPipe } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ProductAccordion } from './product-details/product-accordion/product-accordion';
import { ProductImages } from './product-details/product-images/product-images';
import { ProductNoSidebar } from './product-details/product-no-sidebar/product-no-sidebar';
import { ProductSidebarLeft } from './product-details/product-sidebar-left/product-sidebar-left';
import { ProductSidebarRight } from './product-details/product-sidebar-right/product-sidebar-right';
import { ProductSlider } from './product-details/product-slider/product-slider';
import { ProductSticky } from './product-details/product-sticky/product-sticky';
import { ProductThreeColumnThumbnailBottom } from './product-details/product-three-column-thumbnail-bottom/product-three-column-thumbnail-bottom';
import { ProductThumbnail } from './product-details/product-thumbnail/product-thumbnail';
import { ProductThumbnailOutsideImages } from './product-details/product-thumbnail-outside-images/product-thumbnail-outside-images';
import { ProductVerticalTab } from './product-details/product-vertical-tab/product-vertical-tab';
import { RelatedProduct } from './product-details/widgets/related-product/related-product';
import { StickyCheckout } from './product-details/widgets/sticky-checkout/sticky-checkout';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IProduct, IVariation } from '../../../shared/interface/product.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { SeoService } from '../../../shared/services/seo.service';
import { ProductState } from '../../../shared/store/state/product.state';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-product',
  imports: [
    Breadcrumb,
    ProductThumbnail,
    RelatedProduct,
    StickyCheckout,
    ProductImages,
    ProductSlider,
    ProductSticky,
    ProductAccordion,
    ProductNoSidebar,
    ProductThumbnailOutsideImages,
    ProductVerticalTab,
    ProductThreeColumnThumbnailBottom,
    ProductSidebarLeft,
    ProductSidebarRight,
    AsyncPipe,
  ],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private platformId = inject<Object>(PLATFORM_ID);

  product$: Observable<IProduct> = inject(Store).select(
    ProductState.selectedProduct,
  ) as Observable<IProduct>;
  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: 'Product',
    items: [],
  };

  public layout: string = 'product_thumbnail';
  public product: IProduct;
  public isScrollActive = false;
  public selectedVariants: IVariation;
  public isBrowser: boolean;

  constructor() {
    const platformId = this.platformId;

    this.isBrowser = isPlatformBrowser(platformId);

    this.product$.subscribe(product => {
      if (product) this.breadcrumb.items = [];
      this.breadcrumb.title = product.name;
      this.breadcrumb.items.push(
        { label: 'Product', active: true },
        { label: product.name, active: false },
      );
      this.product = product;
    });

    // For Demo Purpose only
    this.route.queryParams.subscribe(params => {
      if (params['layout']) {
        this.layout = params['layout'];
      } else {
        // Get Product Layout from theme options or fall back to thumbnail
        this.themeOptions$.subscribe(option => {
          this.layout =
            option?.product && option?.product?.product_layout
              ? option?.product?.product_layout
              : 'product_thumbnail';
        });
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isBrowser) {
      const button = document.querySelector('.scroll-button');
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        if (buttonRect.bottom < window.innerHeight && buttonRect.bottom < 0) {
          this.isScrollActive = true;
          document.body.classList.add('stickyCart');
        } else {
          this.isScrollActive = false;
          document.body.classList.remove('stickyCart');
        }

        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          this.isScrollActive = false;
          document.body.classList.remove('stickyCart');
        }
      }
    }
  }

  selectedVariant(variant: IVariation) {
    if (variant) {
      this.selectedVariants = variant;
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('stickyCart');
    }
  }
}
