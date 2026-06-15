import { Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-seller',
  imports: [TranslateModule, Breadcrumb],
  templateUrl: './seller.html',
  styleUrl: './seller.scss',
})
export class Seller {
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: 'become a vendor',
    items: [{ label: 'become a vendor', active: true }],
  };

  public data?: IOption;
  public StorageURL = environment.storageURL;

  constructor() {
    this.themeOption$.subscribe(data => (this.data = data));
  }
}
