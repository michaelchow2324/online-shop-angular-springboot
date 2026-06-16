import { Component, input } from '@angular/core';

import { IOption } from '../../../../interface/theme-option.interface';

@Component({
  selector: 'app-footer-copyright',
  imports: [],
  templateUrl: './footer-copyright.html',
  styleUrl: './footer-copyright.scss',
})
export class FooterCopyright {
  readonly data = input<IOption | null>();

  getYear() {
    const year = new Date().getFullYear() % 100;
    const previousYear = new Date().getFullYear() - 1; // Get last two digits of next year
    const formattedYear = `${previousYear}-${year}`;
    return formattedYear;
  }
}
