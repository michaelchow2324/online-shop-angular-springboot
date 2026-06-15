import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ChangePasswordModal } from '../../../shared/components/widgets/modal/change-password-modal/change-password-modal';
import { EditProfileModal } from '../../../shared/components/widgets/modal/edit-profile-modal/edit-profile-modal';
import { IUser, IUserAddress } from '../../../shared/interface/user.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { AccountState } from '../../../shared/store/state/account.state';

@Component({
  selector: 'app-dashboard',
  imports: [TranslateModule, CurrencySymbolPipe, AsyncPipe, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private modal = inject(NgbModal);

  user$: Observable<IUser> = inject(Store).select(AccountState.user) as Observable<IUser>;

  public address: IUserAddress | null;

  constructor() {
    this.user$.subscribe(user => {
      this.address = user?.address?.length ? user?.address?.[0] : null;
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
