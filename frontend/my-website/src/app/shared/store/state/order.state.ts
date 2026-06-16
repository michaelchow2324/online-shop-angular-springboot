import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IOrder, IOrderCheckout } from '../../interface/order.interface';
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
  static checkout(state: OrderStateModel) {
    return state.checkout;
  }

  @Action(GetOrdersAction)
  getOrders(ctx: StateContext<OrderStateModel>, action: GetOrdersAction) {
    return this.orderService.getOrders(action?.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            order: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(ViewOrderAction)
  viewOrder(ctx: StateContext<OrderStateModel>, { id }: ViewOrderAction) {
    this.orderService.skeletonLoader = true;
    return this.orderService.getOrders().pipe(
      tap({
        next: results => {
          if (results && results.data) {
            const state = ctx.getState();
            const result = results.data.find(order => order.order_number == id);
            ctx.patchState({
              ...state,
              selectedOrder: result,
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
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
