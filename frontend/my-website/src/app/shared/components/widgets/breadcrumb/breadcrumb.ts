import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { IBreadcrumb } from '../../../interface/breadcrumb.interface';

@Component({
  selector: 'app-breadcrumb',
  imports: [TranslateModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  readonly breadcrumb = input<IBreadcrumb>();
}
