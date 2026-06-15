import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../../../environments/environment';
import { IProduct } from '../../../../../../shared/interface/product.interface';
import { IOption } from '../../../../../../shared/interface/theme-option.interface';

@Component({
  selector: 'app-payment-option',
  imports: [TranslateModule],
  templateUrl: './payment-option.html',
  styleUrl: './payment-option.scss',
})
export class PaymentOption {
  readonly product = input<IProduct>();
  readonly option = input<IOption | null>();

  public StorageURL = environment.storageURL;
}
