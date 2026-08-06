import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, of, switchMap, take, timer } from 'rxjs';

import { Breadcrumb } from '../../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../../shared/interface/breadcrumb.interface';
import { ApiErrorBody, ShopOrder } from '../../../../shared/interface/shop-order.interface';
import { OrderService } from '../../../../shared/services/order.service';
import { ClearCartAction } from '../../../../shared/store/action/cart.action';

/**
 * Stripe success_url lands here with ?order=OS-...
 * Payment is confirmed by the Stripe webhook on the server — this page only polls GET.
 */
@Component({
  selector: 'app-checkout-success',
  imports: [TranslateModule, RouterModule, Breadcrumb, NoData, CurrencyPipe, DatePipe],
  templateUrl: './checkout-success.html',
  styleUrl: './checkout-success.scss',
})
export class CheckoutSuccess implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  public breadcrumb: IBreadcrumb = {
    title: 'Order confirmation',
    items: [{ label: 'Checkout', active: false }, { label: 'Success', active: true }],
  };

  public orderNumber: string | null = null;
  public order: ShopOrder | null = null;
  public loading = true;
  public error: string | null = null;
  /** Shown when webhook is slower than the customer returning from Stripe. */
  public pendingPaymentHint = false;

  private readonly pollIntervalMs = 2000;
  private readonly maxPollAttempts = 5;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        take(1),
        switchMap(params => {
          this.orderNumber = params.get('order');
          if (!this.orderNumber) {
            this.loading = false;
            this.error =
              'Missing order number. If you paid, check your email for confirmation.';
            return of(null);
          }
          return this.pollUntilPaidOrTimeout(this.orderNumber, 0);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: order => {
          this.loading = false;
          if (!order) {
            return;
          }
          this.order = order;
          this.pendingPaymentHint = order.status === 'PENDING_PAYMENT';

          // Customer completed Stripe Checkout — local cart can be cleared.
          // Cancel URL goes to /cart and leaves the cart intact.
          this.store.dispatch(new ClearCartAction());
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.error = this.readApiMessage(err);
        },
      });
  }

  /**
   * Webhook may lag a few seconds behind the browser redirect.
   * Poll up to 5 × 2s while status is still PENDING_PAYMENT.
   * Do not call any client endpoint that marks the order paid.
   */
  private pollUntilPaidOrTimeout(
    orderNumber: string,
    attempt: number,
  ): Observable<ShopOrder> {
    return this.orderService.getByOrderNumber(orderNumber).pipe(
      switchMap(order => {
        const stillPending = order.status === 'PENDING_PAYMENT';
        if (!stillPending || attempt + 1 >= this.maxPollAttempts) {
          return of(order);
        }
        return timer(this.pollIntervalMs).pipe(
          switchMap(() => this.pollUntilPaidOrTimeout(orderNumber, attempt + 1)),
        );
      }),
    );
  }

  statusLabel(status: string | undefined): string {
    if (!status) {
      return '';
    }
    return status.replace(/_/g, ' ');
  }

  isZero(value: number | string | null | undefined): boolean {
    return Number(value ?? 0) === 0;
  }

  hideBrokenImage(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.style.display = 'none';
    }
  }

  private readApiMessage(err: HttpErrorResponse): string {
    const body = err.error as ApiErrorBody | string | null;
    if (body && typeof body === 'object' && body.message) {
      return body.message;
    }
    if (err.status === 404) {
      return 'We could not find that order. Double-check the link from Stripe or your email.';
    }
    return err.message || 'Could not load your order.';
  }
}
