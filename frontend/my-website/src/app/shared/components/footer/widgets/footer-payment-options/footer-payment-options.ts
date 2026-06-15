import { Component, input } from '@angular/core';

import { environment } from '../../../../../../environments/environment';
import { IOption } from '../../../../interface/theme-option.interface';

@Component({
  selector: 'app-footer-payment-options',
  imports: [],
  templateUrl: './footer-payment-options.html',
  styleUrl: './footer-payment-options.scss',
})
export class FooterPaymentOptions {
  readonly data = input<IOption | null>();

  public StorageURL = environment.storageURL;
}
