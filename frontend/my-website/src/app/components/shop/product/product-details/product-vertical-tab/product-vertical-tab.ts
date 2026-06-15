import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { CarouselComponent, CarouselModule, SlidesOutputData } from 'ngx-owl-carousel-o';

import * as data from '../../../../../shared/data/owl-carousel';
import { IProduct, IVariation } from '../../../../../shared/interface/product.interface';
import { IOption } from '../../../../../shared/interface/theme-option.interface';
import { ProductService } from '../../../../../shared/services/product.service';
import { PaymentOption } from '../widgets/payment-option/payment-option';
import { ProductBundle } from '../widgets/product-bundle/product-bundle';
import { ProductContent } from '../widgets/product-content/product-content';
import { ProductDeliveryInformation } from '../widgets/product-delivery-information/product-delivery-information';
import { ProductDetails } from '../widgets/product-details/product-details';
import { ProductDigitalOptions } from '../widgets/product-digital-options/product-digital-options';
import { ProductInformation } from '../widgets/product-information/product-information';
import { VerticalDetailsTab } from '../widgets/vertical-details-tab/vertical-details-tab';

@Component({
  selector: 'app-product-vertical-tab',
  imports: [
    NgxImageZoomModule,
    CarouselModule,
    TranslateModule,
    ProductContent,
    ProductInformation,
    ProductDeliveryInformation,
    PaymentOption,
    ProductBundle,
    VerticalDetailsTab,
    ProductDetails,
    ProductDigitalOptions,
    NgClass,
  ],
  templateUrl: './product-vertical-tab.html',
  styleUrl: './product-vertical-tab.scss',
})
export class ProductVerticalTab {
  productService = inject(ProductService);
  private router = inject(Router);
  route = inject(ActivatedRoute);

  readonly product = input<IProduct>();
  readonly option = input<IOption | null>();
  readonly layout = input<string>();

  readonly thumbnailCarousel = viewChild<CarouselComponent>('thumbnailCarousel');

  public selectedVariation: IVariation;
  public activeSlide: string = '0';
  public videType = ['video/mp4', 'video/webm', 'video/ogg'];
  public audioType = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

  public productMainThumbSlider = data.productMainThumbSlider;
  public productThumbSlider = data.productThumbSlider;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);

    void this.router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
        this.activeSlide = '0';
      }
    });
  }

  openFilter() {
    this.productService.productFilter = true;
  }

  selectedVariant(variant: IVariation) {
    this.selectedVariation = variant;
  }

  onCarouselLoad() {
    this.activeSlide = '0';
  }

  onSlideChange(event: SlidesOutputData) {
    if (!this.isBrowser) {
      return;
    }

    if (!event || !event.slides || event.slides.length === 0 || !event.slides[0]?.id) {
      return;
    }

    const slideId = event.slides[0].id;
    if (this.selectedVariation && this.selectedVariation.variation_galleries.length) {
      const matchingImage = this.selectedVariation.variation_galleries.find(
        images => images.id.toString() === slideId,
      );

      if (matchingImage) {
        this.activeSlide = matchingImage.id.toString();
        this.thumbnailCarousel()?.to(this.activeSlide);
      }
    } else {
      this.activeSlide = slideId;
      this.thumbnailCarousel()?.to(this.activeSlide);
    }
  }
}
