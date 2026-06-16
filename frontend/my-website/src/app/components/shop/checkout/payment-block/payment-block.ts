import { UpperCasePipe } from '@angular/common';
import { Component, output, input } from '@angular/core';

import { IValues } from '../../../../shared/interface/setting.interface';

@Component({
  selector: 'app-payment-block',
  imports: [UpperCasePipe],
  templateUrl: './payment-block.html',
  styleUrl: './payment-block.scss',
})
export class PaymentBlock {
  readonly setting = input<IValues>();

  readonly selectPaymentMethod = output<string>();

  constructor() {}

  ngOnInit() {
    // Automatically emit the selectAddress event for the first item if it's available
    const setting = this.setting();
    if (setting && setting?.payment_methods?.length! > 0) {
      if (setting?.payment_methods?.[0].status) {
        this.selectPaymentMethod.emit(setting?.payment_methods?.[0].name);
      }
    }
  }

  set(value: string) {
    this.selectPaymentMethod.emit(value);
  }
}
