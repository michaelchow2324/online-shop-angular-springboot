import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IValues } from '../../../interface/setting.interface';
import { IOption } from '../../../interface/theme-option.interface';
import { SettingState } from '../../../store/state/setting.state';
import { Currency } from '../../header/widgets/currency/currency';
import { Language } from '../../header/widgets/language/language';

@Component({
  selector: 'app-top-bar',
  imports: [RouterModule, TranslateModule, Language, Currency, AsyncPipe],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;

  readonly data = input<IOption | null>();
  readonly darkTopBar = input<boolean>();
}
