import { Component, input } from '@angular/core';

import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';

@Component({
  selector: 'app-theme-banner',
  imports: [ImageLink],
  templateUrl: './theme-banner.html',
  styleUrl: './theme-banner.scss',
})
export class ThemeBanner {
  readonly banners = input<any>();
  readonly class = input<string>();
}
