import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input, viewChild } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { CarouselComponent, CarouselModule, SlidesOutputData } from 'ngx-owl-carousel-o';

import * as data from '../../../../../shared/data/owl-carousel';
import { IProduct, IVariation } from '../../../../../shared/interface/product.interface';
import { IOption } from '../../../../../shared/interface/theme-option.interface';
import { PaymentOption } from '../widgets/payment-option/payment-option';
import { ProductContent } from '../widgets/product-content/product-content';
import { ProductDetails } from '../widgets/product-details/product-details';
import { ProductDetailsAccordion } from '../widgets/product-details-accordion/product-details-accordion';
import { ProductDetailsTab } from '../widgets/product-details-tab/product-details-tab';
import { ProductDigitalOptions } from '../widgets/product-digital-options/product-digital-options';

@Component({
  selector: 'app-product-accordion',
  imports: [
    CarouselModule,
    NgxImageZoomModule,
    TranslateModule,
    ProductContent,
    PaymentOption,
    ProductDetails,
    ProductDetailsAccordion,
    ProductDetailsTab,
    ProductDigitalOptions,
    NgClass,
  ],
  templateUrl: './product-accordion.html',
  styleUrl: './product-accordion.scss',
})
export class ProductAccordion {
  readonly product = input<IProduct>();
  readonly option = input<IOption | null>();

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
