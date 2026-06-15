import { isPlatformBrowser, AsyncPipe } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ClickOutsideDirective } from '../../../../directive/outside.directive';
import { ICurrency, ICurrencyModel } from '../../../../interface/currency.interface';
import { IValues } from '../../../../interface/setting.interface';
import { SelectedCurrencyAction } from '../../../../store/action/setting.action';
import { CurrencyState } from '../../../../store/state/currency.state';
import { SettingState } from '../../../../store/state/setting.state';
import { Button } from '../../../widgets/button/button';

@Component({
  selector: 'app-currency',
  imports: [Button, ClickOutsideDirective, AsyncPipe],
  templateUrl: './currency.html',
  styleUrl: './currency.scss',
})
export class Currency {
  private store = inject(Store);

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  selectedCurrency$: Observable<ICurrency> = inject(Store).select(
    SettingState.selectedCurrency,
  ) as Observable<ICurrency>;
  currency$: Observable<ICurrencyModel> = inject(Store).select(
    CurrencyState.currency,
  ) as Observable<ICurrencyModel>;

  public open: boolean = false;
  public selectedCurrency: ICurrency;
  public setting: IValues;
  public isBrowser: boolean;

  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
    this.selectedCurrency$.subscribe(setting => {
      this.selectedCurrency = setting!;
    });
  }

  openDropDown() {
    this.open = !this.open;
  }

  selectCurrency(currency: ICurrency) {
    this.selectedCurrency = currency;
    this.open = false;
    this.store.dispatch(new SelectedCurrencyAction(currency)).subscribe({
      complete: () => {
        if (this.isBrowser) {
          window.location.reload();
        }
      },
    });
  }

  hideDropdown() {
    this.open = false;
  }
}
