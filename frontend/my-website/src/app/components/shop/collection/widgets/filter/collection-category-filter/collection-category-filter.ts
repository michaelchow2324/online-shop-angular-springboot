import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../../../../shared/components/widgets/no-data/no-data';
import { ICategory, ICategoryModel } from '../../../../../../shared/interface/category.interface';
import { Params } from '../../../../../../shared/interface/core.interface';
import { SearchFilterPipe } from '../../../../../../shared/pipe/search-filter.pipe';
import { GetCategoriesAction } from '../../../../../../shared/store/action/category.action';
import { CategoryState } from '../../../../../../shared/store/state/category.state';

@Component({
  selector: 'app-collection-category-filter',
  imports: [TranslateModule, FormsModule, SearchFilterPipe, NoData, NgTemplateOutlet],
  templateUrl: './collection-category-filter.html',
  styleUrl: './collection-category-filter.scss',
})
export class CollectionCategoryFilter {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.category);

  @Input() filter: Params;

  public categories: ICategory[];
  public selectedCategories: string[] = [];
  public searchText: string = '';

  constructor() {
    this.store.dispatch(new GetCategoriesAction());
  }

  ngOnInit() {
    this.category$.subscribe(res => {
      this.categories = res.data.filter(category => category.type == 'product');
    });
  }

  ngOnChanges() {
    const filter = this.filter;
    this.selectedCategories = filter!['category'] ? filter!['category'].split(',') : [];
  }

  applyFilter(event: Event) {
    const index = this.selectedCategories.indexOf((<HTMLInputElement>event?.target)?.value); // checked and unchecked value

    if ((<HTMLInputElement>event?.target)?.checked)
      this.selectedCategories.push((<HTMLInputElement>event?.target)?.value); // push in array cheked value
    else this.selectedCategories.splice(index, 1); // removed in array unchecked value

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategories.length ? this.selectedCategories?.join(',') : null,
        page: 1,
      },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false, // do trigger navigation
    });
  }

  // check if the item are selected
  checked(item: string) {
    if (this.selectedCategories?.indexOf(item) != -1) {
      return true;
    }
    return false;
  }
}
