import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { IOption } from '../../../../shared/interface/theme-option.interface';
import { FooterOne } from '../footer-one/footer-one';

@Component({
  selector: 'app-footer-four',
  imports: [TranslateModule, FooterOne],
  templateUrl: './footer-four.html',
  styleUrl: './footer-four.scss',
})
export class FooterFour {
  readonly data = input<IOption | null>();
  readonly logo = input<string>();

  public StorageURL = environment.storageURL;

  public active: { [key: string]: boolean } = {
    categories: false,
    useful_link: false,
    help_center: false,
  };

  toggle(value: string) {
    this.active[value] = !this.active[value];
  }
}
