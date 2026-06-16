import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Params } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../../shared/components/widgets/pagination/pagination';
import { IPoint } from '../../../shared/interface/point.interface';
import { IValues } from '../../../shared/interface/setting.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { GetUserTransactionAction } from '../../../shared/store/action/point.action';
import { PointState } from '../../../shared/store/state/point.state';
import { SettingState } from '../../../shared/store/state/setting.state';

@Component({
  selector: 'app-point',
  imports: [
    TranslateModule,
    CurrencySymbolPipe,
    Pagination,
    NoData,
    AsyncPipe,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './point.html',
  styleUrl: './point.scss',
})
export class Point {
  private store = inject(Store);

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  point$: Observable<IPoint> = inject(Store).select(PointState.point) as Observable<IPoint>;

  public filter: Params = {
    page: 1, // Current page number
    paginate: 10, // Display per page,
  };

  constructor() {
    this.store.dispatch(new GetUserTransactionAction(this.filter));
  }

  setPaginate(page: number) {
    this.filter['page'] = page;
    this.store.dispatch(new GetUserTransactionAction(this.filter));
  }
}
