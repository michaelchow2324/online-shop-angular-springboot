import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IOption } from '../../../../../shared/interface/theme-option.interface';

@Component({
  selector: 'app-footer-contact',
  imports: [TranslateModule, NgClass],
  templateUrl: './footer-contact.html',
  styleUrl: './footer-contact.scss',
})
export class FooterContact {
  readonly data = input<IOption | null>();
  readonly icon = input<boolean>(true);
  readonly class = input<string>();
  readonly title = input<boolean>(true);
}
