import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IOption } from '../../../../shared/interface/theme-option.interface';
import { NoData } from '../../widgets/no-data/no-data';
import { FooterAbout } from '../widgets/footer-about/footer-about';
import { FooterCategories } from '../widgets/footer-categories/footer-categories';
import { FooterContact } from '../widgets/footer-contact/footer-contact';
import { FooterCopyright } from '../widgets/footer-copyright/footer-copyright';
import { FooterLinks } from '../widgets/footer-links/footer-links';
import { FooterLogo } from '../widgets/footer-logo/footer-logo';
import { FooterNewsLetter } from '../widgets/footer-news-letter/footer-news-letter';
import { FooterPaymentOptions } from '../widgets/footer-payment-options/footer-payment-options';
import { FooterSocialLinks } from '../widgets/footer-social-links/footer-social-links';

@Component({
  selector: 'app-footer-three',
  imports: [
    TranslateModule,
    FooterLogo,
    FooterAbout,
    FooterContact,
    FooterCategories,
    FooterLinks,
    FooterSocialLinks,
    FooterCopyright,
    FooterPaymentOptions,
    FooterNewsLetter,
    NoData,
  ],
  templateUrl: './footer-three.html',
  styleUrl: './footer-three.scss',
})
export class FooterThree {
  readonly data = input<IOption | null>();
  readonly logo = input<string>();

  public active: { [key: string]: boolean } = {
    categories: false,
    useful_link: false,
    help_center: false,
  };

  toggle(value: string) {
    this.active[value] = !this.active[value];
  }
}
