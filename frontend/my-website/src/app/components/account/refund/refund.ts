import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Params } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../../shared/components/widgets/pagination/pagination';
import { IRefundModel } from '../../../shared/interface/refund.interface';
import { GetRefundAction } from '../../../shared/store/action/refund.action';
import { RefundState } from '../../../shared/store/state/refund.state';

@Component({
  selector: 'app-refund',
  imports: [TranslateModule, Pagination, NoData, AsyncPipe, DatePipe, TitleCasePipe],
  templateUrl: './refund.html',
  styleUrl: './refund.scss',
})
export class Refund {
  private store = inject(Store);

  refund$: Observable<IRefundModel> = inject(Store).select(
    RefundState.refund,
  ) as Observable<IRefundModel>;

  public filter: Params = {
    page: 1, // Current page number
    paginate: 10, // Display per page,
  };

  constructor() {
    this.store.dispatch(new GetRefundAction(this.filter));
  }

  setPaginate(page: number) {
    this.filter['page'] = page;
    this.store.dispatch(new GetRefundAction(this.filter));
  }
}
