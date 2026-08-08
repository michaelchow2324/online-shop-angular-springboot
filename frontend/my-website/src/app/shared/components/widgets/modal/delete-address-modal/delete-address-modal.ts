import { Component, inject, Input, OnInit } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { CustomerAddress } from '../../../../interface/customer-address.interface';
import { DeleteAddressAction } from '../../../../store/action/account.action';
import { Button } from '../../button/button';

@Component({
  selector: 'app-delete-address-modal',
  imports: [TranslateModule, Button],
  templateUrl: './delete-address-modal.html',
  styleUrl: './delete-address-modal.scss',
})
export class DeleteAddressModal implements OnInit {
  public modal = inject(NgbActiveModal);
  private store = inject(Store);

  @Input() userAddress: CustomerAddress;

  ngOnInit() {}

  delete() {
    this.store.dispatch(new DeleteAddressAction(this.userAddress.id)).subscribe({
      complete: () => this.modal.close('deleted'),
    });
  }
}
