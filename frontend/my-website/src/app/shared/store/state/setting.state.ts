import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { ICurrency } from '../../interface/currency.interface';
import { IValues } from '../../interface/setting.interface';
import { SettingService } from '../../services/setting.service';
import { GetSettingOptionAction, SelectedCurrencyAction } from '../action/setting.action';

export class SettingStateModel {
  setting: IValues | null;
  selectedCurrency: ICurrency | null;
}

@State<SettingStateModel>({
  name: 'setting',
  defaults: {
    setting: null,
    selectedCurrency: null,
  },
})
@Injectable()
export class SettingState {
  private settingService = inject(SettingService);

  @Selector()
  static setting(state: SettingStateModel) {
    return state.setting;
  }

  @Selector()
  static selectedCurrency(state: SettingStateModel) {
    return state.selectedCurrency;
  }

  @Action(GetSettingOptionAction)
  getSettingOptions(ctx: StateContext<SettingStateModel>) {
    return this.settingService.getSettingOption().pipe(
      tap({
        next: result => {
          const state = ctx.getState();

          if (!state.selectedCurrency && result?.values?.general) {
            state.selectedCurrency = result?.values?.general.default_currency;
          }

          ctx.patchState({
            ...state,
            setting: result.values,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(SelectedCurrencyAction)
  selectedCurrency(ctx: StateContext<SettingStateModel>, action: SelectedCurrencyAction) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      selectedCurrency: action.payload,
    });
  }
}
