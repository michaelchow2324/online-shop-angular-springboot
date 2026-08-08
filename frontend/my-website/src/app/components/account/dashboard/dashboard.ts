import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ChangePasswordModal } from '../../../shared/components/widgets/modal/change-password-modal/change-password-modal';
import { EditProfileModal } from '../../../shared/components/widgets/modal/edit-profile-modal/edit-profile-modal';
import { CustomerAddress } from '../../../shared/interface/customer-address.interface';
import { IUser } from '../../../shared/interface/user.interface';
import { GetAddressesAction } from '../../../shared/store/action/account.action';
import { AccountState } from '../../../shared/store/state/account.state';

@Component({
  selector: 'app-dashboard',
  imports: [TranslateModule, AsyncPipe, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private modal = inject(NgbModal);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  user$: Observable<IUser> = inject(Store).select(AccountState.user) as Observable<IUser>;
  addresses$: Observable<CustomerAddress[]> = inject(Store).select(
    AccountState.addresses,
  ) as Observable<CustomerAddress[]>;

  public defaultAddress: CustomerAddress | null = null;

  ngOnInit(): void {
    this.store
      .dispatch(new GetAddressesAction())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.addresses$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(addresses => {
      this.defaultAddress = addresses?.find(a => a.isDefault) ?? addresses?.[0] ?? null;
    });
  }

  openModal(value: string) {
    if (value == 'profile') {
      this.modal.open(EditProfileModal, { centered: true, windowClass: 'theme-modal-2' });
    } else if (value == 'password') {
      this.modal.open(ChangePasswordModal, { centered: true, windowClass: 'theme-modal-2' });
    }
  }
}
