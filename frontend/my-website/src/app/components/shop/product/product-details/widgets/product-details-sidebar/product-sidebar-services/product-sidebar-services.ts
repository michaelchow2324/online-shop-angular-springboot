import { Component, SimpleChanges, input } from '@angular/core';

import { environment } from '../../../../../../../../environments/environment';
import { IBanners } from '../../../../../../../shared/interface/theme.interface';

@Component({
  selector: 'app-product-sidebar-services',
  imports: [],
  templateUrl: './product-sidebar-services.html',
  styleUrl: './product-sidebar-services.scss',
})
export class ProductSidebarServices {
  readonly services = input<IBanners[]>();

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
