import { Location, AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { Button } from '../../../shared/components/widgets/button/button';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-error404',
  imports: [TranslateModule, Breadcrumb, Button, AsyncPipe],
  templateUrl: './error404.html',
  styleUrl: './error404.scss',
})
export class Error404 {
  private location = inject(Location);

  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: '404 page',
    items: [{ label: '404 page', active: true }],
  };

  back() {
    this.location.back();
  }
}
