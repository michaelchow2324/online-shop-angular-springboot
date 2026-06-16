import { Component, inject } from '@angular/core';

import { NotificationService } from '../../../services/notification.service';

export interface IAlert {
  type: string | null;
  message: string | null;
}

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class Alert {
  private notificationService = inject(NotificationService);

  public alert: IAlert = {
    type: null,
    message: null,
  };

  constructor() {
    this.notificationService.alertSubject.subscribe(alert => {
      this.alert = <IAlert>alert;
    });
  }

  ngOnDestroy() {
    this.notificationService.notification = true;
  }
}
