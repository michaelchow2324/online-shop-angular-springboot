import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IOrder, IOrderModel } from '../interface/order.interface';
import { ShopOrder } from '../interface/shop-order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;

  getOrders(payload?: Params): Observable<IOrderModel> {
    return this.http.get<IOrderModel>(`${environment.URL}/order.json`, { params: payload });
  }

  /** Logged-in customer orders (guide 05). Requires JWT via AuthInterceptor. */
  getMyOrders(): Observable<ShopOrder[]> {
    return this.http.get<ShopOrder[]>(`${environment.apiUrl}/me/orders`);
  }

  /** Owner-scoped order detail (guide 09) — 404 if not yours. */
  getMyOrder(orderNumber: string): Observable<ShopOrder> {
    return this.http.get<ShopOrder>(
      `${environment.apiUrl}/me/orders/${encodeURIComponent(orderNumber)}`,
    );
  }

  viewOrder(id: number): Observable<IOrder> {
    return this.http.get<IOrder>(`${environment.URL}/order/${id}`);
  }

  orderTracking(payload: { order_number: string; email_or_phone: string }): Observable<IOrder> {
    return this.http.get<IOrder>(`${environment.URL}/trackOrder`, { params: payload });
  }

  /**
   * Real storefront order lookup (Spring Boot).
   * Used on /checkout/success — never calls an endpoint that marks the order paid;
   * Stripe webhook owns that transition.
   */
  getByOrderNumber(orderNumber: string): Observable<ShopOrder> {
    return this.http.get<ShopOrder>(
      `${environment.apiUrl}/orders/${encodeURIComponent(orderNumber)}`,
    );
  }

  /** Admin: list orders by status (guide 07). Requires ADMIN JWT. */
  adminListOrders(status: string = 'paid'): Observable<ShopOrder[]> {
    return this.http.get<ShopOrder[]>(`${environment.apiUrl}/admin/orders`, {
      params: { status },
    });
  }

  /** Admin: mark order shipped with carrier + tracking. */
  adminShipOrder(
    orderNumber: string,
    body: { carrier: string; trackingNumber: string },
  ): Observable<ShopOrder> {
    return this.http.post<ShopOrder>(
      `${environment.apiUrl}/admin/orders/${encodeURIComponent(orderNumber)}/ship`,
      body,
    );
  }

  /** Admin: full Stripe refund for a paid/fulfilling/shipped order. */
  adminRefundOrder(orderNumber: string, reason?: string): Observable<ShopOrder> {
    return this.http.post<ShopOrder>(
      `${environment.apiUrl}/admin/orders/${encodeURIComponent(orderNumber)}/refund`,
      reason ? { reason } : {},
    );
  }
}
