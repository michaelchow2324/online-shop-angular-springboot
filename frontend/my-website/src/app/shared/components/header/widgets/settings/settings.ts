import { isPlatformBrowser, AsyncPipe, JsonPipe } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICurrency, ICurrencyModel } from '../../../../interface/currency.interface';
import { ILanguage, IValues } from '../../../../interface/setting.interface';
import { ILanguages } from '../../../../interface/theme-option.interface';
import { SelectedCurrencyAction } from '../../../../store/action/setting.action';
import { CurrencyState } from '../../../../store/state/currency.state';
import { SettingState } from '../../../../store/state/setting.state';

@Component({
  selector: 'app-settings',
  imports: [TranslateModule, AsyncPipe, JsonPipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private translate = inject(TranslateService);
  private store = inject(Store);

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
  selectedCurrency$: Observable<ICurrency> = inject(Store).select(
    SettingState.selectedCurrency,
  ) as Observable<ICurrency>;
  currency$: Observable<ICurrencyModel> = inject(Store).select(
    CurrencyState.currency,
  ) as Observable<ICurrencyModel>;

  public selectedCurrency: ICurrency;
  public setting: IValues;
  public active: boolean = false;
  public languages: ILanguages[] = [
    {
      language: 'English',
      code: 'en',
      icon: 'us',
    },
    // {
    //   language: 'Français',
    //   code: 'fr',
    //   icon: 'fr',
    // },
    {
      language: '繁體中文',
      code: 'zh-TW',
      icon: 'tw',
    },
  ];

  public selectedLanguage: ILanguages = {
    language: 'English',
    code: 'en',
    icon: 'us',
  };
  public isBrowser: boolean;
  constructor() {
    const platformId = inject(PLATFORM_ID);

    this.isBrowser = isPlatformBrowser(platformId);
    this.selectedCurrency$.subscribe(setting => {
      if (setting) {
        this.selectedCurrency = setting;
      }
    });

    let language = localStorage.getItem('language');

    if (language == null) {
      localStorage.setItem('language', JSON.stringify(this.selectedLanguage));
      this.translate.use(this.selectedLanguage.code);
    } else {
      this.selectedLanguage = JSON.parse(language);
      this.translate.use(this.selectedLanguage.code);
    }
  }

  selectLanguage(language: ILanguage) {
    this.active = false;
    this.translate.use(language.code);
    this.selectedLanguage = language;
    localStorage.setItem('language', JSON.stringify(this.selectedLanguage));

    if (this.isBrowser) {
      window.location.reload();
    }
  }

  selectCurrency(currency: ICurrency) {
    this.selectedCurrency = currency;
    this.store.dispatch(new SelectedCurrencyAction(currency)).subscribe({
      complete: () => {
        if (this.isBrowser) {
          window.location.reload();
        }
      },
    });
  }
}
