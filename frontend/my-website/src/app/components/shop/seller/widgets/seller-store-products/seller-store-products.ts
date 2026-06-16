import { Component, input } from '@angular/core';

import { IStores } from '../../../../../shared/interface/store.interface';

@Component({
  selector: 'app-seller-store-products',
  imports: [],
  templateUrl: './seller-store-products.html',
  styleUrl: './seller-store-products.scss',
})
export class SellerStoreProducts {
  readonly store = input<IStores>();
}
