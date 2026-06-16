import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IValues } from '../../../../interface/setting.interface';
import { SettingState } from '../../../../store/state/setting.state';

@Component({
  selector: 'app-header-logo',
  imports: [RouterModule, AsyncPipe],
  templateUrl: './header-logo.html',
  styleUrl: './header-logo.scss',
})
export class HeaderLogo {
  readonly logo = input<string | null>();

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
}
