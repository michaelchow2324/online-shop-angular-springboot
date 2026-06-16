import { Component, SimpleChanges, input } from '@angular/core';

import { IBanners, IParallax, IParallaxBanner } from '../../../shared/interface/theme.interface';
import { ThemeParallaxBanner } from '../widgets/theme-parallax-banner/theme-parallax-banner';

@Component({
  selector: 'app-parallax',
  imports: [ThemeParallaxBanner],
  templateUrl: './parallax.html',
  styleUrl: './parallax.scss',
})
export class Parallax {
  readonly data = input<IParallax>();
  readonly slug = input<string>();

  public filteredBanners: IParallaxBanner[];

  ngOnChanges(change: SimpleChanges) {
    this.filteredBanners = change['data']?.currentValue?.content?.parallax_banner?.banners?.filter(
      (banner: IBanners) => {
        return banner.status;
      },
    );
  }
}
