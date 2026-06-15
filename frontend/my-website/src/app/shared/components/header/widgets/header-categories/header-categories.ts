import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICategory, ICategoryModel } from '../../../../interface/category.interface';
import { GetHeaderCategoriesAction } from '../../../../store/action/category.action';
import { CategoryState } from '../../../../store/state/category.state';

@Component({
  selector: 'app-header-categories',
  imports: [RouterModule],
  templateUrl: './header-categories.html',
  styleUrl: './header-categories.scss',
})
export class HeaderCategories {
  private store = inject(Store);

  headerCategory$: Observable<ICategoryModel> = inject(Store).select(CategoryState.headerCategory);

  readonly categoryIds = input<number[]>();

  public categories: ICategory[];

  ngOnInit() {
    const categoryIds = this.categoryIds();
    this.store.dispatch(
      new GetHeaderCategoriesAction({
        status: 1,
        ids: categoryIds?.join(','),
      }),
    );

    if (categoryIds && categoryIds.length) {
      this.headerCategory$.subscribe(res => {
        if (res) {
          this.categories = res.data.filter(category => this.categoryIds()?.includes(category.id));
        }
      });
    }
  }
}
