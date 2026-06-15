import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { SkeletonOffer } from './skeleton-offer/skeleton-offer';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICouponModel } from '../../../shared/interface/coupon.interface';
import { CouponService } from '../../../shared/services/coupon.service';
import { GetCouponsAction } from '../../../shared/store/action/coupon.action';
import { CouponState } from '../../../shared/store/state/coupon.state';

@Component({
  selector: 'app-offer',
  imports: [TranslateModule, Breadcrumb, NoData, SkeletonOffer, AsyncPipe],
  templateUrl: './offer.html',
  styleUrl: './offer.scss',
})
export class Offer {
  private store = inject(Store);
  couponService = inject(CouponService);

  public skeletonItems = Array.from({ length: 6 }, (_, index) => index);
  public breadcrumb: IBreadcrumb = {
    title: 'Offers',
    items: [{ label: 'Offers', active: true }],
  };

  coupon$: Observable<ICouponModel> = inject(Store).select(CouponState.coupon);

  constructor() {
    this.store.dispatch(new GetCouponsAction({ status: 1 }));
  }

  copyFunction(txt: string) {
    void navigator.clipboard.writeText(txt);
  }
}
