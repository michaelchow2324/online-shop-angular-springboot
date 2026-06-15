import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { INotification } from '../../interface/notification.interface';
import { NotificationService } from '../../services/notification.service';
import { GetNotificationAction, MarkAsReadNotificationAction } from '../action/notification.action';

export class NotificationStateModel {
  notification = {
    data: [] as INotification[],
    total: 0,
  };
}

@State<NotificationStateModel>({
  name: 'notification',
  defaults: {
    notification: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class NotificationState {
  private notificationService = inject(NotificationService);

  @Selector()
  static notification(state: NotificationStateModel) {
    return state.notification.data;
  }

  @Action(GetNotificationAction)
  getNotification(ctx: StateContext<NotificationStateModel>, action: GetNotificationAction) {
    return this.notificationService.getNotifications(action?.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            notification: {
              data: result.data,
              total: result?.total ? result?.total : result.data.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(MarkAsReadNotificationAction)
  markAsRead(_ctx: StateContext<NotificationStateModel>) {
    // Notification Mark As Read Logic Here
  }
}
