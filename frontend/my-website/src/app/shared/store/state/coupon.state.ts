import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { ICoupon } from '../../interface/coupon.interface';
import { CouponService } from '../../services/coupon.service';
import { GetCouponsAction } from '../action/coupon.action';

export class CouponStateModel {
  coupon = {
    data: [] as ICoupon[],
    total: 0,
  };
}

@State<CouponStateModel>({
  name: 'coupon',
  defaults: {
    coupon: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class CouponState {
  private couponService = inject(CouponService);

  @Selector()
  static coupon(state: CouponStateModel) {
    return state.coupon;
  }

  @Action(GetCouponsAction)
  getCoupons(ctx: StateContext<CouponStateModel>, action: GetCouponsAction) {
    this.couponService.skeletonLoader = true;
    return this.couponService.getCoupons(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            coupon: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        complete: () => {
          this.couponService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }
}
