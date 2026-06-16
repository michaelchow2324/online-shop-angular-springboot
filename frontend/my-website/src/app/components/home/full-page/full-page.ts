import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  SimpleChanges,
  inject,
  viewChild,
  input,
} from '@angular/core';

import SwiperCore from 'swiper';
import { Autoplay, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';

import { ImageLink } from '../../../shared/components/widgets/image-link/image-link';
import { IBanners, IFullPage } from '../../../shared/interface/theme.interface';

SwiperCore.use([Navigation, Pagination, Autoplay, Mousewheel]);

@Component({
  selector: 'app-full-page',
  imports: [ImageLink],
  templateUrl: './full-page.html',
  styleUrl: './full-page.scss',
})
export class FullPage {
  private platformId = inject<Object>(PLATFORM_ID);

  readonly swiperContainer = viewChild.required<ElementRef>('swiperContainer');

  readonly data = input<IFullPage>();
  readonly slug = input<string>();

  public filteredBanners: IBanners[] = [];
  public isBrowser: boolean;
  public swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    navigation: false,
    direction: 'vertical',
    autoHeight: true,
    mousewheel: true,
    allowTouchMove: true,
    scrollbar: { draggable: true },
    pagination: { clickable: true },
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
  };

  constructor() {
    const platformId = this.platformId;

    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['data']?.currentValue) {
      this.filteredBanners =
        change['data'].currentValue.content?.home_banner?.banners?.filter(
          (banner: IBanners) => banner.status,
        ) || [];
    }
  }

  ngAfterViewInit() {
    const swiperContainer = this.swiperContainer();
    if (this.isBrowser && swiperContainer) {
      new SwiperCore(swiperContainer.nativeElement, this.swiperConfig);
    }
  }
}
