import { TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ILink } from '../../../../interface/theme-option.interface';

@Component({
  selector: 'app-footer-links',
  imports: [RouterModule, TitleCasePipe],
  templateUrl: './footer-links.html',
  styleUrl: './footer-links.scss',
})
export class FooterLinks {
  readonly links = input<ILink[]>([]);
}
