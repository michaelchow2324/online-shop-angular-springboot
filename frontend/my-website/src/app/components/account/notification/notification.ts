import { isPlatformBrowser, AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { INotification } from '../../../shared/interface/notification.interface';
import { MarkAsReadNotificationAction } from '../../../shared/store/action/notification.action';
import { NotificationState } from '../../../shared/store/state/notification.state';

@Component({
  selector: 'app-notification',
  imports: [TranslateModule, NoData, AsyncPipe, DatePipe],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification {
  private store = inject(Store);

  notification$: Observable<INotification[]> = inject(Store).select(
    NotificationState.notification,
  ) as Observable<INotification[]>;

  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.store.dispatch(new MarkAsReadNotificationAction());
    }
  }
}
