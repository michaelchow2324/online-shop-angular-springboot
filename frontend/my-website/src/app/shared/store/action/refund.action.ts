import { Params } from '../../interface/core.interface';

export class GetRefundAction {
  static readonly type = '[Refund] Get';
  constructor(public payload?: Params) {}
}

export class SendRefundRequestAction {
  static readonly type = '[Refund] Post';
  constructor(public payload?: Params) {}
}
