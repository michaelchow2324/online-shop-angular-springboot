import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IValues } from '../../../../interface/setting.interface';
import { SettingState } from '../../../../store/state/setting.state';

@Component({
  selector: 'app-footer-logo',
  imports: [RouterModule, AsyncPipe],
  templateUrl: './footer-logo.html',
  styleUrl: './footer-logo.scss',
})
export class FooterLogo {
  readonly logo = input<string>();

  setting$: Observable<IValues> = inject(Store).select(SettingState.setting) as Observable<IValues>;
}
