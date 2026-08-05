import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ShippingQuote, ShippingQuoteRequest } from '../interface/shop-order.interface';

@Injectable({
  providedIn: 'root',
})
export class ShippingService {
  private http = inject(HttpClient);

  /**
   * Server recomputes cart subtotal from DB product prices, then applies zone rules.
   * Client never sends a fee — quote is display-only until place-order.
   */
  quote(payload: ShippingQuoteRequest): Observable<ShippingQuote> {
    return this.http.post<ShippingQuote>(`${environment.apiUrl}/shipping/quote`, payload);
  }
}
