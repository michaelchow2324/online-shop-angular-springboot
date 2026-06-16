import {
  DatePipe,
  Location,
  AsyncPipe,
  NgClass,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subject, mergeMap, of, switchMap, takeUntil } from 'rxjs';

import { PayModal } from '../../../../shared/components/widgets/modal/pay-modal/pay-modal';
import { RefundModal } from '../../../../shared/components/widgets/modal/refund-modal/refund-modal';
import { IOrderStatusModel } from '../../../../shared/interface/order-status.interface';
import { IOrder } from '../../../../shared/interface/order.interface';
import { IProduct } from '../../../../shared/interface/product.interface';
import { CurrencySymbolPipe } from '../../../../shared/pipe/currency.pipe';
import { TextConverterPipe } from '../../../../shared/pipe/text-converter.pipe';
import { GetOrderStatusAction } from '../../../../shared/store/action/order-status.action';
import {
  DownloadInvoiceAction,
  ViewOrderAction,
} from '../../../../shared/store/action/order.action';
import { OrderStatusState } from '../../../../shared/store/state/order-status.state';
import { OrderState } from '../../../../shared/store/state/order.state';

@Component({
  selector: 'app-details',
  imports: [
    TranslateModule,
    RouterModule,
    CurrencySymbolPipe,
    NgbModule,
    TextConverterPipe,
    AsyncPipe,
    DatePipe,
    NgClass,
    TitleCasePipe,
    UpperCasePipe,
  ],
  providers: [DatePipe],
  templateUrl: './details.html',
  styleUrl: './details.scss',
})
export class Details {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private modal = inject(NgbModal);
  private datePipe = inject(DatePipe);
  private location = inject(Location);

  orderStatus$: Observable<IOrderStatusModel> = inject(Store).select(OrderStatusState.orderStatus);

  private destroy$ = new Subject<void>();

  public order: IOrder;
  public isLogin: boolean;

  constructor() {
    this.store.dispatch(new GetOrderStatusAction());
  }

  ngOnInit() {
    this.isLogin = !!this.store.selectSnapshot(state => state.auth && state.auth.access_token);
    this.route.params
      .pipe(
        switchMap(params => {
          if (!params['id']) return of();
          return this.store
            .dispatch(new ViewOrderAction(params['id']))
            .pipe(mergeMap(() => this.store.select(OrderState.selectedOrder)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(order => {
        this.order = order!;
        if (this.order && this.order?.order_status_activities) {
          this.order?.order_status_activities?.map(actStatus => {
            this.orderStatus$.subscribe(res => {
              res.data.map(status => {
                if (actStatus.status == status.name) {
                  let convertDate = this.datePipe.transform(
                    actStatus?.changed_at,
                    'dd MMM yyyy hh:mm:a',
                  )!;
                  status['activities_date'] = convertDate;
                }
              });
            });
          });
        }
      });
  }

  openPayModal(order: IOrder) {
    const modal = this.modal.open(PayModal, { centered: true });
    modal.componentInstance.orderDetails = order;
  }

  openRefundModal(product: IProduct, order_id: number) {
    const modal = this.modal.open(RefundModal, {
      centered: true,
      windowClass: 'theme-modal-2 refund-modal',
    });
    modal.componentInstance.productDetails = product;
    modal.componentInstance.orderId = order_id;
  }

  download(id: number) {
    this.store.dispatch(new DownloadInvoiceAction({ order_number: id }));
  }

  back() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
