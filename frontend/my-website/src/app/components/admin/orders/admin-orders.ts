import { CurrencyPipe, DatePipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { afterNextRender, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";

import { Store } from "@ngxs/store";

import { hasAdminSession } from "../../../core/guard/admin.guard";
import { Breadcrumb } from "../../../shared/components/widgets/breadcrumb/breadcrumb";
import { NoData } from "../../../shared/components/widgets/no-data/no-data";
import { IBreadcrumb } from "../../../shared/interface/breadcrumb.interface";
import {
  ApiErrorBody,
  ShopOrder,
  ShopOrderStatus,
} from "../../../shared/interface/shop-order.interface";
import { AuthService } from "../../../shared/services/auth.service";
import { OrderService } from "../../../shared/services/order.service";
import { displayCarrier } from "../../../shared/utils/tracking-url";

/**
 * Minimal admin fulfillment UI (guide 07) — list paid orders and ship with tracking.
 */
@Component({
  selector: "app-admin-orders",
  imports: [
    RouterModule,
    Breadcrumb,
    NoData,
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: "./admin-orders.html",
  styleUrl: "./admin-orders.scss",
})
export class AdminOrders {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);

  public breadcrumb: IBreadcrumb = {
    title: "Admin orders",
    items: [
      { label: "Admin", active: false },
      { label: "Orders", active: true },
    ],
  };

  public orders: ShopOrder[] = [];
  public loading = true;
  public error: string | null = null;
  public statusFilter: ShopOrderStatus = "PAID";

  public shipTarget: ShopOrder | null = null;
  public shipping = false;
  public shipError: string | null = null;
  public shipForm: FormGroup = this.fb.group({
    carrier: ["canada_post", Validators.required],
    trackingNumber: ["", Validators.required],
  });

  constructor() {
    // SSR cannot read localStorage; enforce ADMIN only after the browser hydrates.
    afterNextRender(() => {
      if (!hasAdminSession(this.store)) {
        this.authService.redirectUrl = "/admin/orders";
        this.authService.isLogin = true;
        void this.router.navigateByUrl("/");
        return;
      }
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    this.orderService
      .adminListOrders(this.statusFilter)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this.loading = false;
          this.orders = orders;
        },
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.orders = [];
          this.error = this.readApiMessage(err);
        },
      });
  }

  setStatus(status: ShopOrderStatus): void {
    this.statusFilter = status;
    this.loadOrders();
  }

  openShip(order: ShopOrder): void {
    this.shipTarget = order;
    this.shipError = null;
    this.shipForm.reset({
      carrier: "canada_post",
      trackingNumber: "",
    });
  }

  closeShip(): void {
    this.shipTarget = null;
    this.shipError = null;
    this.shipping = false;
  }

  submitShip(): void {
    if (!this.shipTarget || this.shipForm.invalid) {
      this.shipForm.markAllAsTouched();
      return;
    }
    this.shipping = true;
    this.shipError = null;
    const { carrier, trackingNumber } = this.shipForm.getRawValue() as {
      carrier: string;
      trackingNumber: string;
    };

    this.orderService
      .adminShipOrder(this.shipTarget.orderNumber, {
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.shipping = false;
          this.closeShip();
          this.loadOrders();
        },
        error: (err: HttpErrorResponse) => {
          this.shipping = false;
          this.shipError = this.readApiMessage(err);
        },
      });
  }

  canShip(order: ShopOrder): boolean {
    return order.status === "PAID" || order.status === "FULFILLING";
  }

  carrierLabel(carrier: string | null): string {
    return displayCarrier(carrier);
  }

  private readApiMessage(err: HttpErrorResponse): string {
    const body = err.error as ApiErrorBody | string | null;
    if (body && typeof body === "object" && body.message) {
      return body.message;
    }
    if (err.status === 401 || err.status === 403) {
      return "Admin access required. Log in as an ADMIN user.";
    }
    return err.message || "Request failed.";
  }
}
