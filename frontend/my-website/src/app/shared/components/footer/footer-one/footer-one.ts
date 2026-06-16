import { Component, ElementRef, inject, viewChild, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { IOption } from '../../../../shared/interface/theme-option.interface';
import { ThemeOptionService } from '../../../services/theme-option.service';
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
  selector: 'app-footer-one',
  imports: [
    TranslateModule,
    FooterLogo,
    FooterAbout,
    FooterSocialLinks,
    FooterCategories,
    FooterLinks,
    FooterContact,
    FooterCopyright,
    FooterPaymentOptions,
    FooterNewsLetter,
    NoData,
  ],
  templateUrl: './footer-one.html',
  styleUrl: './footer-one.scss',
})
export class FooterOne {
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IOption | null>();
  readonly logo = input<string>();

  public active: { [key: string]: boolean } = {
    categories: false,
    useful_link: false,
  };

  readonly descriptionElement = viewChild<ElementRef>('description');

  ngAfterViewInit() {
    // Use a timeout to ensure that the element is rendered before trying to access its height
    setTimeout(() => {
      const description = this.descriptionElement()?.nativeElement;
      this.themeOptionService.footer_height = description?.offsetHeight;
    }, 0);
  }

  toggle(value: string) {
    this.active[value] = !this.active[value];
  }
}
