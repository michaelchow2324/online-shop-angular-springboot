import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IOrder, IOrderCheckout } from '../../interface/order.interface';
import { ShopOrder } from '../../interface/shop-order.interface';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order.service';
import {
  CheckoutAction,
  DownloadInvoiceAction,
  GetOrdersAction,
  OrderTrackingAction,
  PlaceOrderAction,
  RePaymentAction,
  ViewOrderAction,
} from '../action/order.action';

export class OrderStateModel {
  order = {
    data: [] as IOrder[],
    total: 0,
  };
  selectedOrder: IOrder | null;
  /** Real Spring order for account detail (guide 05). */
  selectedShopOrder: ShopOrder | null;
  checkout: IOrderCheckout | null;
}

@State<OrderStateModel>({
  name: 'order',
  defaults: {
    order: {
      data: [],
      total: 0,
    },
    selectedOrder: null,
    selectedShopOrder: null,
    checkout: null,
  },
})
@Injectable()
export class OrderState {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private orderService = inject(OrderService);

  @Selector()
  static order(state: OrderStateModel) {
    return state.order;
  }

  @Selector()
  static selectedOrder(state: OrderStateModel) {
    return state.selectedOrder;
  }

  @Selector()
  static selectedShopOrder(state: OrderStateModel) {
    return state.selectedShopOrder;
  }

  @Selector()
  static checkout(state: OrderStateModel) {
    return state.checkout;
  }

  @Action(GetOrdersAction)
  getOrders(ctx: StateContext<OrderStateModel>, _action: GetOrdersAction) {
    // Guide 05: real API is a flat list of ShopOrder — map into Multikart table fields.
    return this.orderService.getMyOrders().pipe(
      tap({
        next: result => {
          const data = (result ?? []).map(o => ({
            order_number: o.orderNumber,
            created_at: o.createdAt,
            total: o.total,
            payment_status: o.status,
            payment_method: 'stripe',
          })) as unknown as IOrder[];

          ctx.patchState({
            order: {
              data,
              total: data.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to load orders');
        },
      }),
    );
  }

  @Action(ViewOrderAction)
  viewOrder(ctx: StateContext<OrderStateModel>, { id }: ViewOrderAction) {
    this.orderService.skeletonLoader = true;
    // id is orderNumber (e.g. OS-20260806-A1B2) from /account/order/details/:id
    return this.orderService.getByOrderNumber(String(id)).pipe(
      tap({
        next: shopOrder => {
          ctx.patchState({ selectedShopOrder: shopOrder });
        },
        error: err => {
          ctx.patchState({ selectedShopOrder: null });
          throw new Error(err?.error?.message || 'Order not found');
        },
        complete: () => {
          this.orderService.skeletonLoader = false;
        },
      }),
    );
  }

  @Action(CheckoutAction)
  checkout(ctx: StateContext<OrderStateModel>, _action: CheckoutAction) {
    const state = ctx.getState();

    // It Just Static IValues as per cart default value (When you are using api then you need calculate as per your requirement)
    const order = {
      total: {
        convert_point_amount: 65.66,
        convert_wallet_balance: 8.47,
        coupon_total_discount: 10,
        points: 1970,
        points_amount: 65.66,
        shipping_total: 0,
        sub_total: 39.81,
        tax_total: 1.99,
        total: 41.8,
        wallet_balance: 8.47,
      },
    };

    ctx.patchState({
      ...state,
      checkout: order,
    });
  }

  @Action(PlaceOrderAction)
  placeOrder(_ctx: StateContext<OrderStateModel>, _action: PlaceOrderAction) {
    // Place order Logic Here
  }

  @Action(RePaymentAction)
  rePayment(_ctx: StateContext<OrderStateModel>, _action: RePaymentAction) {
    // Repayment Logic Here
  }

  @Action(OrderTrackingAction)
  orderTracking(ctx: StateContext<OrderStateModel>, action: OrderTrackingAction) {
    // this.notificationService.notification = false;
    return this.orderService.orderTracking(action.payload).pipe(
      tap({
        next: result => {
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            selectedOrder: result,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(DownloadInvoiceAction)
  downloadInvoice(_ctx: StateContext<OrderStateModel>, _action: DownloadInvoiceAction) {
    // Download invoice Logic Here
  }
}
