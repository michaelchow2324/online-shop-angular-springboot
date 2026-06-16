import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

import { IProduct, IVariation } from '../../../../interface/product.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import { CartButton } from '../widgets/cart-button/cart-button';
import { ProductBoxImageVariant } from '../widgets/image-variant/image-variant';
import { ProductHoverAction } from '../widgets/product-hover-action/product-hover-action';
import { Wishlist } from '../widgets/product-hover-action/wishlist/wishlist';

@Component({
  selector: 'app-product-box-four',
  imports: [
    CarouselModule,
    NgbModule,
    TranslateModule,
    CurrencySymbolPipe,
    RouterModule,
    ProductHoverAction,
    Wishlist,
    CartButton,
    ProductBoxImageVariant,
  ],
  templateUrl: './product-box-four.html',
  styleUrl: './product-box-four.scss',
})
export class ProductBoxFour {
  readonly product = input<IProduct>();

  public selectedVariation: IVariation;
  public activeSlide: string = '0';
  public options: OwlOptions = {
    loop: true,
    nav: true,
    dots: false,
    navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
    responsive: {
      0: {
        items: 1,
      },
    },
  };

  // IProduct Main Thumb Slider
  public productMainThumbSlider: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    items: 1,
    nav: true,
    navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
    autoplay: false,
    autoHeight: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    navSpeed: 300,
    responsive: {
      0: {
        items: 1,
      },
    },
  };

  constructor() {
    const config = inject(NgbRatingConfig);

    config.max = 5;
    config.readonly = true;
  }

  selectVariation(variation: IVariation) {
    if (variation) {
      this.selectedVariation = variation;
      // this.selectedVariant.emit(this.selectedVariation);
    }
  }
}
