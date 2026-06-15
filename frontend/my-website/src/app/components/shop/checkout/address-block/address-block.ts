import { Component, output, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IUserAddress } from '../../../../shared/interface/user.interface';

@Component({
  selector: 'app-address-block',
  imports: [TranslateModule],
  templateUrl: './address-block.html',
  styleUrl: './address-block.scss',
})
export class AddressBlock {
  readonly addresses = input<IUserAddress[] | undefined>([]);
  readonly type = input<string>('shipping');

  readonly selectAddress = output<number>();

  constructor() {}

  ngOnChanges() {
    // Automatically emit the selectAddress event for the first item if it's available
    const addresses = this.addresses();
    if (addresses && addresses.length > 0) {
      const firstAddressId = addresses[0].id;
      this.selectAddress.emit(firstAddressId);
    }
  }

  set(event: Event) {
    this.selectAddress.emit(Number((<HTMLInputElement>event.target)?.value));
  }
}
