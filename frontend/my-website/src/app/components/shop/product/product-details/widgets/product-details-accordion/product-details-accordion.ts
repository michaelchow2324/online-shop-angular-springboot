import { Component, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IProduct } from '../../../../../../shared/interface/product.interface';
import { ProductDeliveryInformation } from '../product-delivery-information/product-delivery-information';
import { ProductInformation } from '../product-information/product-information';

@Component({
  selector: 'app-product-details-accordion',
  imports: [NgbModule, TranslateModule, ProductInformation, ProductDeliveryInformation],
  templateUrl: './product-details-accordion.html',
  styleUrl: './product-details-accordion.scss',
})
export class ProductDetailsAccordion {
  readonly product = input<IProduct>();
}
