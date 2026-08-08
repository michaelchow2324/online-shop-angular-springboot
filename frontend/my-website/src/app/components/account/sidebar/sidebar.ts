import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ConfirmationModal } from '../../../shared/components/widgets/modal/confirmation-modal/confirmation-modal';
import { INotification } from '../../../shared/interface/notification.interface';
import { IUser } from '../../../shared/interface/user.interface';
import { AccountService } from '../../../shared/services/account.service';
import { LogoutAction } from '../../../shared/store/action/auth.action';
import { AccountState } from '../../../shared/store/state/account.state';
import { NotificationState } from '../../../shared/store/state/notification.state';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, TranslateModule, AsyncPipe, TitleCasePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private store = inject(Store);
  private modal = inject(NgbModal);
  accountService = inject(AccountService);

  notification$: Observable<INotification[]> = inject(Store).select(
    NotificationState.notification,
  ) as Observable<INotification[]>;
  user$: Observable<IUser> = inject(Store).select(AccountState.user) as Observable<IUser>;

  public unreadNotificationCount: number;

  constructor() {
    this.notification$.subscribe(notification => {
      this.unreadNotificationCount = notification?.filter(item => !item.read_at)?.length;
    });
  }

  logout() {
    const modal = this.modal.open(ConfirmationModal, { centered: true, windowClass: '' });
    modal.componentInstance.confirm.subscribe((val: boolean) => {
      if (val === true) {
        this.store.dispatch(new LogoutAction());
        this.modal.dismissAll();
      }
    });
  }

  closeMenu() {
    this.accountService.isOpenMenu = false;
  }

  uploadImage(_event?: unknown) {
    // Profile image upload is out of scope for guide 09 (displayName only).
  }
}
