import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IStores } from '../../../../../shared/interface/store.interface';

@Component({
  selector: 'app-seller-contact-details',
  imports: [TranslateModule],
  templateUrl: './seller-contact-details.html',
  styleUrl: './seller-contact-details.scss',
})
export class SellerContactDetails {
  readonly store = input<IStores>();
}
