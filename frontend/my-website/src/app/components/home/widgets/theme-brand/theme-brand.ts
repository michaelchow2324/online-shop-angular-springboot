import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { BrandSlider } from '../../../../shared/data/owl-carousel';
import { IBrand, IBrandModel } from '../../../../shared/interface/brand.interface';
import { BrandState } from '../../../../shared/store/state/brand.state';

@Component({
  selector: 'app-theme-brand',
  imports: [CarouselModule, RouterModule, NoData, TranslateModule],
  templateUrl: './theme-brand.html',
  styleUrl: './theme-brand.scss',
})
export class ThemeBrand {
  brand$: Observable<IBrandModel> = inject(Store).select(BrandState.brand);

  readonly brandIds = input<number[]>();
  readonly bgLight = input<boolean>(false);

  public brands: IBrand[] = [];
  public options = BrandSlider;

  ngOnChanges() {
    if (Array.isArray(this.brandIds())) {
      this.brand$.subscribe(brand => {
        this.brands = brand?.data?.filter(brand => this.brandIds()?.includes(brand?.id));
      });
    }
  }
}
