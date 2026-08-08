import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AddressModal } from '../../../shared/components/widgets/modal/address-modal/address-modal';
import { DeleteAddressModal } from '../../../shared/components/widgets/modal/delete-address-modal/delete-address-modal';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { CustomerAddress } from '../../../shared/interface/customer-address.interface';
import {
  GetAddressesAction,
  SetDefaultAddressAction,
} from '../../../shared/store/action/account.action';
import { AccountState } from '../../../shared/store/state/account.state';

@Component({
  selector: 'app-addresses',
  imports: [TranslateModule, NoData, AsyncPipe, TitleCasePipe],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss',
})
export class Addresses implements OnInit {
  private store = inject(Store);
  private modal = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  addresses$: Observable<CustomerAddress[]> = inject(Store).select(
    AccountState.addresses,
  ) as Observable<CustomerAddress[]>;

  ngOnInit(): void {
    this.store.dispatch(new GetAddressesAction()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  AddressModal(address?: CustomerAddress) {
    const modal = this.modal.open(AddressModal, { centered: true, windowClass: 'theme-modal-2' });
    if (address) {
      modal.componentInstance.userAddress = address;
    }
  }

  removeAddress(address: CustomerAddress) {
    const modal = this.modal.open(DeleteAddressModal, { centered: true });
    modal.componentInstance.userAddress = address;
  }

  setDefault(address: CustomerAddress) {
    if (address.isDefault) {
      return;
    }
    this.store.dispatch(new SetDefaultAddressAction(address.id));
  }
}
