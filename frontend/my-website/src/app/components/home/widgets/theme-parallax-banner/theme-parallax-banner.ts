import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-theme-parallax-banner',
  imports: [NgClass],
  templateUrl: './theme-parallax-banner.html',
  styleUrl: './theme-parallax-banner.scss',
})
export class ThemeParallaxBanner {
  readonly banners = input<any>();
  readonly class = input<string>();
  readonly text_right = input<boolean>(false);

  public StorageURL = environment.storageURL;
}
