import { Component, input } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IStores } from '../../../../../shared/interface/store.interface';

@Component({
  selector: 'app-seller-store-rating',
  imports: [TranslateModule, NgbModule],
  templateUrl: './seller-store-rating.html',
  styleUrl: './seller-store-rating.scss',
})
export class SellerStoreRating {
  readonly store = input<IStores>();
}
