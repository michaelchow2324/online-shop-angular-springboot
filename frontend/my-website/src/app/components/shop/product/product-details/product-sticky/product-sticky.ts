import { Component, inject, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { IProduct, IVariation } from '../../../../../shared/interface/product.interface';
import { IOption } from '../../../../../shared/interface/theme-option.interface';
import { ProductService } from '../../../../../shared/services/product.service';
import { ThemeOptionService } from '../../../../../shared/services/theme-option.service';
import { PaymentOption } from '../widgets/payment-option/payment-option';
import { ProductBundle } from '../widgets/product-bundle/product-bundle';
import { ProductContent } from '../widgets/product-content/product-content';
import { ProductDeliveryInformation } from '../widgets/product-delivery-information/product-delivery-information';
import { ProductDetails } from '../widgets/product-details/product-details';
import { ProductDetailsTab } from '../widgets/product-details-tab/product-details-tab';
import { ProductDigitalOptions } from '../widgets/product-digital-options/product-digital-options';
import { ProductInformation } from '../widgets/product-information/product-information';

@Component({
  selector: 'app-product-sticky',
  imports: [
    CarouselModule,
    TranslateModule,
    ProductContent,
    ProductInformation,
    ProductDeliveryInformation,
    PaymentOption,
    ProductBundle,
    ProductDetailsTab,
    ProductDetails,
    ProductDigitalOptions,
  ],
  templateUrl: './product-sticky.html',
  styleUrl: './product-sticky.scss',
})
export class ProductSticky {
  productService = inject(ProductService);
  private themeOptionService = inject(ThemeOptionService);

  readonly product = input<IProduct>();
  readonly option = input<IOption | null>();

  public selectedVariation: IVariation;
  public videType = ['video/mp4', 'video/webm', 'video/ogg'];
  public audioType = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

  selectedVariant(variant: IVariation) {
    this.selectedVariation = variant;
  }
}
