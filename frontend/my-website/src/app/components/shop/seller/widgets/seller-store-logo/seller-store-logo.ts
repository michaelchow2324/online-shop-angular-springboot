import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IStores } from '../../../../../shared/interface/store.interface';

@Component({
  selector: 'app-seller-store-logo',
  imports: [RouterModule],
  templateUrl: './seller-store-logo.html',
  styleUrl: './seller-store-logo.scss',
})
export class SellerStoreLogo {
  readonly store = input<IStores>();
}
