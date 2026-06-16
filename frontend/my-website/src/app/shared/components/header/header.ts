import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { HeaderEight } from './header-eight/header-eight';
import { HeaderFive } from './header-five/header-five';
import { HeaderFour } from './header-four/header-four';
import { HeaderOne } from './header-one/header-one';
import { HeaderSeven } from './header-seven/header-seven';
import { HeaderSix } from './header-six/header-six';
import { HeaderThree } from './header-three/header-three';
import { HeaderTwo } from './header-two/header-two';
import { IOption } from '../../interface/theme-option.interface';
import { IMobileMenu } from './widgets/mobile-menu/mobile-menu';
import { ThemeOptionState } from '../../store/state/theme-option.state';

@Component({
  selector: 'app-header',
  imports: [
    HeaderOne,
    HeaderTwo,
    HeaderThree,
    HeaderFour,
    HeaderFive,
    HeaderSix,
    HeaderSeven,
    HeaderEight,
    IMobileMenu,
    AsyncPipe,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private router = inject(Router);
  route = inject(ActivatedRoute);

  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;
  activeTheme$: Observable<string> = inject(Store).select(ThemeOptionState.themeOptions);

  readonly logo = input<string>();

  public style: string = 'header_one';
  public sticky: boolean = true;
  public path: string;
  public overlayHeaders = [
    'fashion_seven',
    'furniture_dark',
    'jewellery_one',
    'christmas',
    'gym',
    'digital_download',
  ];
  public overlayTheme: string;
  public activeTheme: string;
  public routes: string;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.path = params['theme'];
      this.setHeader();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setHeader();
      }
    });
  }

  setHeader() {
    if (this.path) {
      if (
        this.path == 'fashion_one' ||
        this.path == 'fashion_two' ||
        this.path == 'fashion_three' ||
        this.path == 'fashion_four' ||
        this.path == 'electronics_two' ||
        this.path == 'jewellery_three' ||
        this.path == 'bag' ||
        this.path == 'watch' ||
        this.path == 'kids' ||
        this.path == 'beauty' ||
        this.path == 'goggles' ||
        this.path == 'video_slider' ||
        this.path == 'gradient' ||
        this.path == 'left_sidebar' ||
        this.path == 'parallax' ||
        this.path == 'vegetables_three' ||
        this.path == 'fashion_seven'
      ) {
        this.style = 'header_one';
      } else if (this.path == 'fashion_five') {
        this.style = 'header_three';
      } else if (
        this.path == 'fashion_six' ||
        this.path == 'jewellery_two' ||
        this.path == 'medical' ||
        this.path == 'perfume' ||
        this.path == 'nursery'
      ) {
        this.style = 'header_one';
      } else if (
        this.path == 'furniture_dark' ||
        this.path == 'jewellery_one' ||
        this.path == 'christmas' ||
        this.path == 'digital_download' ||
        this.path == 'single_product'
      ) {
        this.style = 'header_four';
      } else if (this.path == 'furniture_one' || this.path == 'shoes') {
        this.style = 'header_five';
      } else if (this.path == 'furniture_two') {
        this.style = 'header_six';
      } else if (this.path == 'electronics_one') {
        this.style = 'header_one';
      } else if (this.path == 'electronics_three' || this.path == 'books' || this.path == 'pets') {
        this.style = 'header_six';
      } else if (this.path == 'marketplace_one') {
        this.style = 'header_one';
      } else if (this.path == 'marketplace_two') {
        this.style = 'header_six';
      } else if (this.path == 'marketplace_three') {
        this.style = 'header_six';
      } else if (this.path == 'marketplace_four') {
        this.style = 'header_six';
      } else if (this.path == 'vegetables_one') {
        this.style = 'header_five';
      } else if (this.path == 'vegetables_two') {
        this.style = 'header_six';
      } else if (this.path == 'vegetables_four') {
        this.style = 'header_two';
      } else if (this.path == 'marijuana') {
        this.style = 'header_five';
      } else if (this.path == 'bicycle') {
        this.style = 'header_seven';
      } else if (this.path == 'tools') {
        this.style = 'header_one';
      } else if (this.path == 'video' || this.path == 'full_page') {
        this.style = 'header_eight';
      }
    } else if (!this.path) {
      this.themeOption$.subscribe(theme => {
        this.style = theme?.header ? theme?.header.header_options : 'header_one';
        this.sticky = theme?.header && theme?.header?.sticky_header_enable ? true : this.sticky;
      });
    }
  }
}
