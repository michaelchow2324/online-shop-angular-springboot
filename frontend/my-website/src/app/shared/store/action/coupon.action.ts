import { Params } from '../../interface/core.interface';

export class GetCouponsAction {
  static readonly type = '[Coupon] Get';
  constructor(public payload?: Params) {}
}
