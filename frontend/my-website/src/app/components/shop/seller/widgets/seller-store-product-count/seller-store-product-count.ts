import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { IStores } from '../../../../../shared/interface/store.interface';

@Component({
  selector: 'app-seller-store-product-count',
  imports: [RouterModule, TranslateModule],
  templateUrl: './seller-store-product-count.html',
  styleUrl: './seller-store-product-count.scss',
})
export class SellerStoreProductCount {
  readonly store = input<IStores>();
}
