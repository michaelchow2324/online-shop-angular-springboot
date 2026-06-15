import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { IMenu } from '../../../../interface/menu.interface';

@Component({
  selector: 'app-link-box',
  imports: [TranslateModule],
  templateUrl: './link-box.html',
  styleUrl: './link-box.scss',
})
export class LinkBox {
  private router = inject(Router);

  readonly menu = input<IMenu>();

  redirect(path: string) {
    void this.router.navigateByUrl(path);
  }
}
