import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { Store } from '@ngxs/store';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { Categories } from '../../../../../shared/components/widgets/categories/categories';
import { IOption } from '../../../../../shared/interface/theme-option.interface';
import { GetCategoriesAction } from '../../../../../shared/store/action/category.action';
import { ThemeOptionState } from '../../../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-collection-categories',
  imports: [Categories, AsyncPipe],
  templateUrl: './collection-categories.html',
  styleUrl: './collection-categories.scss',
})
export class CollectionCategories {
  private store = inject(Store);

  readonly style = input<string>('vertical');
  readonly image = input<string>();
  readonly theme = input<string>();
  readonly title = input<string>();
  readonly sliderOption = input<OwlOptions>();

  public categoryIds: number[];

  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  constructor() {
    this.themeOption$.subscribe(category => {
      this.categoryIds = category?.collection?.collection_categories_ids;
    });

    // Get Category
    if (this.categoryIds?.length) {
      this.store.dispatch(
        new GetCategoriesAction({
          status: 1,
          ids: this.categoryIds?.join(','),
        }),
      ).subscribe;
    }
  }
}
