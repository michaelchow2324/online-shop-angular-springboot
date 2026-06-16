import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Params } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../../shared/components/widgets/pagination/pagination';
import { IWallet } from '../../../shared/interface/wallet.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { GetUserTransactionAction } from '../../../shared/store/action/wallet.action';
import { WalletState } from '../../../shared/store/state/wallet.state';

@Component({
  selector: 'app-wallet',
  imports: [
    TranslateModule,
    CurrencySymbolPipe,
    Pagination,
    NoData,
    AsyncPipe,
    DatePipe,
    TitleCasePipe,
  ],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss',
})
export class Wallet {
  private store = inject(Store);

  wallet$: Observable<IWallet> = inject(Store).select(WalletState.wallet) as Observable<IWallet>;

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
