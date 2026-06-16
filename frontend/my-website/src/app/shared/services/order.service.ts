import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IOrder, IOrderModel } from '../interface/order.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;

  getOrders(payload?: Params): Observable<IOrderModel> {
    return this.http.get<IOrderModel>(`${environment.URL}/order.json`, { params: payload });
  }

  viewOrder(id: number): Observable<IOrder> {
    return this.http.get<IOrder>(`${environment.URL}/order/${id}`);
  }

  orderTracking(payload: { order_number: string; email_or_phone: string }): Observable<IOrder> {
    return this.http.get<IOrder>(`${environment.URL}/trackOrder`, { params: payload });
  }
}
