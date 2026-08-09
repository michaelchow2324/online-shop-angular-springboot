import { Component, inject } from '@angular/core';

import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../services/auth.service';
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
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  public alert: IAlert = {
    type: null,
    message: null,
  };
  public resending = false;

  constructor() {
    this.notificationService.alertSubject.subscribe(alert => {
      this.alert = <IAlert>alert;
      this.resending = false;
    });
  }

  get showResendVerification(): boolean {
    const msg = (this.alert.message || '').toLowerCase();
    return this.alert.type === 'error' && msg.includes('verify your email');
  }

  resendVerification(event: Event): void {
    event.preventDefault();
    const email = this.authService.lastLoginEmail?.trim();
    if (!email) {
      this.notificationService.showError('Enter your email in the form, then try Resend again.');
      return;
    }
    if (this.resending) {
      return;
    }
    this.resending = true;
    this.authService.resendVerification(email).subscribe({
      next: res => {
        // Avoid showSuccess — it dismisses the login modal.
        this.notificationService.alertSubject.next({ type: 'success', message: res.message });
        this.toastr.success(res.message);
        this.resending = false;
      },
      error: err => {
        this.notificationService.showError(
          err?.error?.message || 'Could not resend verification email.',
        );
        this.resending = false;
      },
    });
  }

  ngOnDestroy() {
    this.notificationService.notification = true;
  }
}
