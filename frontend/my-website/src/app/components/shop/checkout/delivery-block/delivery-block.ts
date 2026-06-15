import { Component, output, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IDeliveryBlock, IValues } from '../../../../shared/interface/setting.interface';

@Component({
  selector: 'app-delivery-block',
  imports: [TranslateModule],
  templateUrl: './delivery-block.html',
  styleUrl: './delivery-block.scss',
})
export class DeliveryBlock {
  readonly setting = input<IValues>();

  readonly selectDelivery = output<IDeliveryBlock>();

  public selectedIndex: number;
  public deliveryType: string | null = null;
  public delivery_description: string | null = null;
  public delivery_interval: string | null = null;

  ngOnInit() {
    const setting = this.setting();
    if (setting?.delivery) {
      // Automatically emit the selectAddress event for the first item if it's available
      let delivery: IDeliveryBlock = {
        delivery_description:
          setting.delivery?.default?.title + ' | ' + setting.delivery?.default?.description,
        delivery_interval: this.delivery_interval,
      };
      this.selectDelivery.emit(delivery);
    }
  }

  setDeliveryDescription(value: string, type: string) {
    this.delivery_description = value!;
    this.deliveryType = type;
    let delivery: IDeliveryBlock = {
      delivery_description: this.delivery_description,
      delivery_interval: this.delivery_interval,
    };
    this.selectDelivery.emit(delivery);
  }

  setDeliveryInterval(value: string, index: number) {
    this.selectedIndex = index!;
    this.delivery_interval = value;
    let delivery: IDeliveryBlock = {
      delivery_description: this.delivery_description,
      delivery_interval: this.delivery_interval,
    };
    this.selectDelivery.emit(delivery);
  }
}
