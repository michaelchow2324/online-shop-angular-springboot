import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-collection-category-banner',
  imports: [TranslateModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {
  readonly class = input<string | undefined>('banner-contain-2 hover-effect');
  readonly imageUrl = input<string>();

  public StorageURL = environment.storageURL;
}
