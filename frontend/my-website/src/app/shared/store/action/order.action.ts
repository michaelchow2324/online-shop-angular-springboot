import { Params } from '../../interface/core.interface';
import { ICheckoutPayload, IRePaymentPayload } from '../../interface/order.interface';

export class GetOrdersAction {
  static readonly type = '[Order] Get';
  constructor(public payload?: Params) {}
}

export class ViewOrderAction {
  static readonly type = '[Order] View';
  constructor(public id: number) {}
}

export class CheckoutAction {
  static readonly type = '[Order] Checkout';
  constructor(public payload: ICheckoutPayload) {}
}

export class PlaceOrderAction {
  static readonly type = '[Order] Place';
  constructor(public payload: ICheckoutPayload) {}
}

export class RePaymentAction {
  static readonly type = '[Order] Repayment';
  constructor(public payload: IRePaymentPayload) {}
}

export class VerifyPaymentAction {
  static readonly type = '[Order] Verify';
  constructor(public id: number) {}
}

export class OrderTrackingAction {
  static readonly type = '[Order] Tracking';
  constructor(public payload: { order_number: string; email_or_phone: string }) {}
}

export class DownloadInvoiceAction {
  static readonly type = '[Order] Invoice';
  constructor(public payload: Params) {}
}
