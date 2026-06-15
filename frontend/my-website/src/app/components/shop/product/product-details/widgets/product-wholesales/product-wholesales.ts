import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IProduct } from '../../../../../../shared/interface/product.interface';
import { CurrencySymbolPipe } from '../../../../../../shared/pipe/currency.pipe';

@Component({
  selector: 'app-product-wholesales',
  imports: [TranslateModule, CurrencySymbolPipe],
  templateUrl: './product-wholesales.html',
  styleUrl: './product-wholesales.scss',
})
export class ProductWholesales {
  readonly product = input<IProduct | null>();
}
