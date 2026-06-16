import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IProduct } from '../../../../../../shared/interface/product.interface';

@Component({
  selector: 'app-product-information',
  imports: [TranslateModule],
  templateUrl: './product-information.html',
  styleUrl: './product-information.scss',
})
export class ProductInformation {
  readonly product = input<IProduct | null>();
}
