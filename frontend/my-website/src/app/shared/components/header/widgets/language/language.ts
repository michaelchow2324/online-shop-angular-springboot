import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ClickOutsideDirective } from '../../../../directive/outside.directive';
import { ILanguages } from '../../../../interface/theme-option.interface';
import { Button } from '../../../widgets/button/button';

@Component({
  selector: 'app-language',
  imports: [Button, ClickOutsideDirective],
  templateUrl: './language.html',
  styleUrl: './language.scss',
})
export class Language {
  private translate = inject(TranslateService);
  private platformId = inject<Object>(PLATFORM_ID);

  public active: boolean = false;
  public languages: ILanguages[] = [
    {
      language: 'English',
      code: 'en',
      icon: 'us',
    },
    // {
    //   language: 'Français',
    //   code: 'fr',
    //   icon: 'fr',
    // },
    {
      language: '繁體中文',
      code: 'zh-HK',
      icon: 'hk',
    },
  ];

  public selectedLanguage: ILanguages = {
    language: 'English',
    code: 'en',
    icon: 'us',
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      let language = localStorage.getItem('language');

      if (language == null) {
        localStorage.setItem('language', JSON.stringify(this.selectedLanguage));
        this.translate.use(this.selectedLanguage.code);
      } else {
        this.selectedLanguage = JSON.parse(language);
        this.translate.use(this.selectedLanguage.code);
      }
    }
  }

  openDropDown() {
    this.active = !this.active;
  }

  hideDropdown() {
    this.active = false;
  }

  selectLanguage(language: ILanguages) {
    this.active = false;
    this.translate.use(language.code);
    this.selectedLanguage = language;
    localStorage.setItem('language', JSON.stringify(this.selectedLanguage));

    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }
}
