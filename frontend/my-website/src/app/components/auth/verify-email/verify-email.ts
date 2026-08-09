import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { distinctUntilChanged, EMPTY, map, switchMap } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { AuthService } from '../../../shared/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthState } from '../../../shared/store/state/auth.state';

type VerifyStatus = 'loading' | 'success' | 'error';

/**
 * Guide 10 — public page opened from the verify-email mail link.
 * Calls {@code POST /api/auth/verify-email?token=} (claim runs on the server).
 * Browser-only: SSR would otherwise consume the one-time token before hydration.
 */
@Component({
  selector: 'app-verify-email',
  imports: [RouterModule, TranslateModule, Breadcrumb, ReactiveFormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private store = inject(Store);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  public breadcrumb: IBreadcrumb = {
    title: 'Verify email',
    items: [{ label: 'Verify email', active: true }],
  };

  public status: VerifyStatus = 'loading';
  public message: string | null = null;
  public verifiedEmail: string | null = null;
  public resending = false;
  public resendForm: FormGroup = this.formBuilder.group({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // Keep loading shell on the server; real verify runs once in the browser.
      return;
    }

    this.route.queryParamMap
      .pipe(
        map(params => params.get('token')?.trim() ?? ''),
        distinctUntilChanged(),
        switchMap(token => {
          if (!token) {
            this.status = 'error';
            this.message =
              'This verification link is missing a token. Request a new email below.';
            return EMPTY;
          }
          this.status = 'loading';
          this.message = null;
          return this.authService.verifyEmail(token);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: me => {
          this.status = 'success';
          this.verifiedEmail = me.email;
          this.message =
            'Your email is verified. Any past guest orders for this address are now linked to your account.';
        },
        error: (err: HttpErrorResponse | Error) => {
          this.status = 'error';
          this.message = this.readError(err);
        },
      });
  }

  get isLoggedIn(): boolean {
    return !!this.store.selectSnapshot(AuthState.accessToken);
  }

  openLogin(): void {
    this.authService.redirectUrl = '/account/order';
    this.authService.isLogin = true;
  }

  resendVerification(): void {
    this.resendForm.markAllAsTouched();
    if (this.resendForm.invalid || this.resending) {
      return;
    }
    this.resending = true;
    const email = String(this.resendForm.value.email ?? '');
    this.authService.resendVerification(email).subscribe({
      next: res => {
        this.notificationService.showSuccess(res.message);
        this.resending = false;
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError(
          err.error?.message || 'Could not resend verification email.',
        );
        this.resending = false;
      },
    });
  }

  private readError(err: HttpErrorResponse | Error): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string } | string | null;
      if (body && typeof body === 'object' && body.message) {
        return body.message;
      }
      if (typeof body === 'string' && body.trim()) {
        return body;
      }
      if (err.status === 0) {
        return 'Cannot reach the store server. Check that the API is running.';
      }
    }
    return err.message || 'Verification failed. The link may be invalid, expired, or already used.';
  }
}
