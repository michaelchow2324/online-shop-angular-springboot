import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, Language, Currency],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;

  @Input() data: IOption | null;
  @Input() darkTopBar: boolean;
}
