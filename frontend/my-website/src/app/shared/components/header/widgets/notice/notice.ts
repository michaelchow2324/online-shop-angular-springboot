import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, PLATFORM_ID, inject, viewChild, input } from '@angular/core';

import SwiperCore from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { SwiperOptions } from 'swiper/types';

import { ITopBarContent } from '../../../../interface/theme-option.interface';

SwiperCore.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-notice',
  imports: [],
  templateUrl: './notice.html',
  styleUrl: './notice.scss',
})
export class Notice {
  private platformId = inject<Object>(PLATFORM_ID);

  readonly swiperContainer = viewChild.required<ElementRef>('swiperContainer');

  readonly content = input<ITopBarContent[]>();

  public isBrowser: boolean;
  public swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    navigation: false,
    direction: 'vertical',
    autoHeight: true,
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

  ngAfterViewInit() {
    const swiperContainer = this.swiperContainer();
    if (this.isBrowser && swiperContainer) {
      new SwiperCore(swiperContainer.nativeElement, this.swiperConfig);
    }
  }
}
