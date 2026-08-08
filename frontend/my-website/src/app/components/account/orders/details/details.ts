import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { of, switchMap } from 'rxjs';

import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { ShopOrder, ShopOrderStatus } from '../../../../shared/interface/shop-order.interface';
import { ViewOrderAction } from '../../../../shared/store/action/order.action';
import { OrderState } from '../../../../shared/store/state/order.state';
import { displayCarrier, trackingUrl } from '../../../../shared/utils/tracking-url';

/**
 * Account order detail — loads Spring {@code GET /api/me/orders/{orderNumber}} (owner-scoped).
 */
@Component({
  selector: 'app-details',
  imports: [TranslateModule, RouterModule, NoData, CurrencyPipe, DatePipe],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class Details implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  public order: ShopOrder | null = null;
  public loading = true;
  public error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const orderNumber = params.get('id');
          if (!orderNumber) {
            this.loading = false;
            this.error = 'Missing order number.';
            return of(null);
          }
          this.loading = true;
          this.error = null;
          return this.store.dispatch(new ViewOrderAction(orderNumber)).pipe(
            switchMap(() => of(this.store.selectSnapshot(OrderState.selectedShopOrder))),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: order => {
          this.loading = false;
          this.order = order;
          if (!order) {
            this.error = this.error ?? 'Order not found.';
          }
        },
        error: (err: Error) => {
          this.loading = false;
          this.order = null;
          this.error = err?.message || 'Failed to load order.';
        },
      });
  }

  back(): void {
    this.location.back();
  }

  statusLabel(status: ShopOrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'Pending payment';
      case 'PAID':
        return 'Paid';
      case 'FULFILLING':
        return 'Preparing';
      case 'SHIPPED':
        return 'Shipped';
      case 'CANCELLED':
        return 'Cancelled';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status;
    }
  }

  isZero(value: number | string | null | undefined): boolean {
    return Number(value ?? 0) === 0;
  }

  trackPackageUrl(order: ShopOrder): string | null {
    return trackingUrl(order.carrier, order.trackingNumber);
  }

  carrierLabel(carrier: string | null | undefined): string {
    return displayCarrier(carrier);
  }

  hideBrokenImage(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.style.display = 'none';
    }
  }
}
