import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CheckoutSessionResponse,
  CreateShopOrderRequest,
} from '../interface/shop-order.interface';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http = inject(HttpClient);

  /**
   * Creates a pending_payment order + Stripe Checkout Session.
   * Caller must redirect the browser to `checkoutUrl` (hosted Stripe page).
   */
  createSession(payload: CreateShopOrderRequest): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${environment.apiUrl}/checkout/sessions`,
      payload,
    );
  }
}
