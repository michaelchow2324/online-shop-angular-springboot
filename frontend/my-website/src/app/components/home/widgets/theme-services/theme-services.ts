import { NgClass } from '@angular/common';
import { Component, SimpleChanges, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../../../../../environments/environment';
import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { IAboutFutures } from '../../../../shared/interface/theme-option.interface';
import { IBanners } from '../../../../shared/interface/theme.interface';

@Component({
  selector: 'app-theme-services',
  imports: [NoData, TranslateModule, NgClass],
  templateUrl: './theme-services.html',
  styleUrl: './theme-services.scss',
})
export class ThemeServices {
  readonly services = input<IBanners[] | IAboutFutures[]>();
  readonly class = input<string>();
  readonly type = input<string>();

  public filteredServices: IBanners[];
  public StorageURL = environment.storageURL;

  ngOnChanges(change: SimpleChanges) {
    if (change['services'] && change['services'].currentValue) {
      this.filteredServices = change['services'].currentValue.filter((service: IBanners) => {
        return service.status;
      });
    }
  }
}
