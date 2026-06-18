import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { resolveMediaUrl } from '../../../../shared/utils/resolve-media-url';
import { SocialMediaSlider } from '../../../../shared/data/owl-carousel';
import { ThemeTitle } from '../theme-title/theme-title';

@Component({
  selector: 'app-theme-social-media',
  imports: [CarouselModule, ThemeTitle, NoData, TranslateModule, NgClass],
  templateUrl: './theme-social-media.html',
  styleUrl: './theme-social-media.scss',
})
export class ThemeSocialMedia {
  readonly media = input<any>();
  readonly title = input<string>();
  readonly options = input<OwlOptions>(SocialMediaSlider);
  readonly class = input<string>();
  readonly type = input<string>();

  mediaUrl = resolveMediaUrl;
}
