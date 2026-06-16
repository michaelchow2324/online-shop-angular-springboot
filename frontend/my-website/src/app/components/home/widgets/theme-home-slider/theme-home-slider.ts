import { Component, SimpleChanges, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CarouselModule } from 'ngx-owl-carousel-o';

import { environment } from '../../../../../environments/environment';
import { ImageLink } from '../../../../shared/components/widgets/image-link/image-link';
import { homeBannerSlider } from '../../../../shared/data/owl-carousel';
import { IBanners } from '../../../../shared/interface/theme.interface';

@Component({
  selector: 'app-theme-home-slider',
  imports: [RouterModule, CarouselModule, ImageLink],
  templateUrl: './theme-home-slider.html',
  styleUrl: './theme-home-slider.scss',
})
export class ThemeHomeSlider {
  readonly banners = input<any>();
  readonly theme = input<string>();

  public options = homeBannerSlider;
  public filteredBanners: IBanners[];
  public videoType = ['mp4', 'webm', 'ogg'];
  public StorageURL = environment.storageURL;

  ngOnChanges(change: SimpleChanges) {
    this.filteredBanners = change['banners'].currentValue?.banners?.filter((banner: IBanners) => {
      return banner.status;
    });
  }
}
