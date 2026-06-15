import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../../../../shared/components/widgets/no-data/no-data';
import { IBrand, IBrandModel } from '../../../../../../shared/interface/brand.interface';
import { Params } from '../../../../../../shared/interface/core.interface';
import { SearchFilterPipe } from '../../../../../../shared/pipe/search-filter.pipe';
import { GetBrandsAction } from '../../../../../../shared/store/action/brand.action';
import { BrandState } from '../../../../../../shared/store/state/brand.state';

@Component({
  selector: 'app-collection-brand-filter',
  imports: [TranslateModule, FormsModule, SearchFilterPipe, NoData],
  templateUrl: './collection-brand-filter.html',
  styleUrl: './collection-brand-filter.scss',
})
export class CollectionBrandFilter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  brand$: Observable<IBrandModel> = inject(Store).select(BrandState.brand);

  @Input() filter: Params;

  public brands: IBrand[];
  public selectedBrands: string[] = [];
  public searchText: string = '';

  ngOnInit() {
    this.store.dispatch(new GetBrandsAction({ status: 1 }));
    this.brand$.subscribe(brand => {
      this.brands = brand.data;
    });
  }

  ngOnChanges() {
    const filter = this.filter;
    this.selectedBrands = filter!['brand'] ? filter!['brand'].split(',') : [];
  }

  applyFilter(event: Event) {
    const index = this.selectedBrands.indexOf((<HTMLInputElement>event?.target)?.value); // checked and unchecked value

    if ((<HTMLInputElement>event?.target)?.checked)
      this.selectedBrands.push((<HTMLInputElement>event?.target)?.value); // push in array cheked value
    else this.selectedBrands.splice(index, 1); // removed in array unchecked value

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        brand: this.selectedBrands.length ? this.selectedBrands?.join(',') : null,
        page: 1,
      },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false, // do trigger navigation
    });
  }

  // check if the item are selected
  checked(item: string) {
    if (this.selectedBrands?.indexOf(item) != -1) {
      return true;
    }
    return false;
  }
}
