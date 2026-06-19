import { Component, inject, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';

import { ICurrency } from '../../../../interface/currency.interface';
import { SelectedCurrencyAction } from '../../../../store/action/setting.action';

const CAD_CURRENCY = {
  id: 1,
  code: 'CAD',
  symbol: '$',
  no_of_decimal: 2,
  exchange_rate: 1,
  symbol_position: 'before_price',
  thousands_separator: 'comma',
  decimal_separator: 'comma',
  system_reserve: 0,
  status: true,
  created_by_id: 0,
} as ICurrency;

@Component({
  selector: 'app-currency',
  imports: [],
  templateUrl: './currency.html',
  styleUrl: './currency.scss',
})
export class Currency implements OnInit {
  private store = inject(Store);

  ngOnInit() {
    this.store.dispatch(new SelectedCurrencyAction(CAD_CURRENCY));
  }
}
