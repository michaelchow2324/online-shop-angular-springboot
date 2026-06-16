import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { SkeletonOffer } from '../../../../../components/page/offer/skeleton-offer/skeleton-offer';
import { ICouponModel } from '../../../../interface/coupon.interface';
import { CouponService } from '../../../../services/coupon.service';
import { CouponState } from '../../../../store/state/coupon.state';
import { Button } from '../../button/button';

@Component({
  selector: 'app-coupon-modal',
  imports: [Button, TranslateModule, SkeletonOffer, AsyncPipe],
  templateUrl: './coupon-modal.html',
  styleUrl: './coupon-modal.scss',
})
export class CouponModal {
  modal = inject(NgbActiveModal);
  couponService = inject(CouponService);

  coupon$: Observable<ICouponModel> = inject(Store).select(CouponState.coupon);

  copyFunction(txt: string) {
    void navigator.clipboard.writeText(txt);
  }
}
