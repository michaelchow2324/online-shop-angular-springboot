import { Component, inject, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { IUserAddress } from '../../../../interface/user.interface';
import { DeleteAddressAction } from '../../../../store/action/account.action';
import { Button } from '../../button/button';

@Component({
  selector: 'app-delete-address-modal',
  imports: [TranslateModule, Button],
  templateUrl: './delete-address-modal.html',
  styleUrl: './delete-address-modal.scss',
})
export class DeleteAddressModal {
  public modal = inject(NgbActiveModal);
  private store = inject(Store);

  @Input() userAddress: IUserAddress;

  public userAction = {};

  ngOnInit() {
    const userAddress = this.userAddress;
    if (userAddress) {
      this.userAction = {
        data: userAddress,
      };
    }
  }

  delete() {
    this.store.dispatch(new DeleteAddressAction(this.userAddress.id));
  }
}
