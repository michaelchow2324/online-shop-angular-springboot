import {
  Location,
  AsyncPipe,
  DatePipe,
  NgClass,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { mergeMap, switchMap, takeUntil } from 'rxjs/operators';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICountry, ICountryModel } from '../../../shared/interface/country.interface';
import { IOrderStatusModel } from '../../../shared/interface/order-status.interface';
import { IOrder } from '../../../shared/interface/order.interface';
import { IStates, IStatesModel } from '../../../shared/interface/state.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { GetOrderStatusAction } from '../../../shared/store/action/order-status.action';
import { OrderTrackingAction } from '../../../shared/store/action/order.action';
import { CountryState } from '../../../shared/store/state/country.state';
import { OrderStatusState } from '../../../shared/store/state/order-status.state';
import { OrderState } from '../../../shared/store/state/order.state';
import { StateState } from '../../../shared/store/state/state.state';

@Component({
  selector: 'app-order-details',
  imports: [
    TranslateModule,
    CurrencySymbolPipe,
    RouterModule,
    Breadcrumb,
    NoData,
    AsyncPipe,
    DatePipe,
    NgClass,
    TitleCasePipe,
    UpperCasePipe,
  ],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  orderStatus$: Observable<IOrderStatusModel> = inject(Store).select(OrderStatusState.orderStatus);
  country$: Observable<ICountryModel> = inject(Store).select(
    CountryState.country,
  ) as Observable<ICountryModel>;
  state$: Observable<IStatesModel> = inject(Store).select(
    StateState.state,
  ) as Observable<IStatesModel>;

  private destroy$ = new Subject<void>();

  public order: IOrder | null;
  public email_or_phone: string;
  public countries: ICountry[] = [];
  public states: IStates[] = [];

  public breadcrumb: IBreadcrumb = {
    title: 'Order Details',
    items: [{ label: 'Order Details', active: false }],
  };

  constructor() {
    this.store.dispatch(new GetOrderStatusAction());
    this.country$.subscribe(country => (this.countries = country.data));
    this.state$.subscribe(state => (this.states = state.data));
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(
        switchMap(params => {
          this.email_or_phone = params['email_or_phone'];
          return this.store
            .dispatch(
              new OrderTrackingAction({
                order_number: params['order_number'].toString(),
                email_or_phone: params['email_or_phone'],
              }),
            )
            .pipe(mergeMap(() => this.store.select(OrderState.selectedOrder)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(order => {
        this.order = order;
        this.order &&
          (this.order.consumer = order?.guest_order ? order?.guest_order : order?.consumer);
      });
  }

  getCountryName(id: number) {
    return this.countries.find(country => country.id == id)?.name;
  }

  getStateName(id: number) {
    return this.states.find(state => state.id == id)?.name;
  }

  back() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
