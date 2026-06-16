import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { teamSlider, testimonialSlider } from '../../../shared/data/owl-carousel';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IAboutUs, IOption } from '../../../shared/interface/theme-option.interface';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-about-us',
  imports: [CarouselModule, TranslateModule, Breadcrumb, NgClass],
  templateUrl: './about-us.html',
  styleUrl: './about-us.scss',
})
export class AboutUs {
  private store = inject(Store);

  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public aboutUs?: IAboutUs;
  public testimonialOptions = testimonialSlider;
  public teamOptions = teamSlider;
  public StorageURL = environment.storageURL;

  public breadcrumb: IBreadcrumb = {
    title: 'About Us',
    items: [{ label: 'About Us', active: true }],
  };

  constructor() {
    this.themeOptions$.subscribe(option => {
      this.aboutUs = option?.about_us;
    });
  }
}
