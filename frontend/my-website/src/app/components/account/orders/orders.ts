import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Params, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../../shared/components/widgets/pagination/pagination';
import { IOrderModel } from '../../../shared/interface/order.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { GetOrdersAction } from '../../../shared/store/action/order.action';
import { OrderState } from '../../../shared/store/state/order.state';

@Component({
  selector: 'app-orders',
  imports: [
    TranslateModule,
    RouterModule,
    CurrencySymbolPipe,
    Pagination,
    NoData,
    AsyncPipe,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  private store = inject(Store);

  order$: Observable<IOrderModel> = inject(Store).select(
    OrderState.order,
  ) as Observable<IOrderModel>;

  public filter: Params = {
    page: 1, // Current page number
    paginate: 10, // Display per page,
  };

  constructor() {
    this.store.dispatch(new GetOrdersAction(this.filter));
  }

  setPaginate(page: number) {
    this.filter['page'] = page;
    this.store.dispatch(new GetOrdersAction(this.filter));
  }
}
