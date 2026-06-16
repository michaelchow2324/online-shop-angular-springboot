import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICategory, ICategoryModel } from '../../../../interface/category.interface';
import { GetFooterCategoriesAction } from '../../../../store/action/category.action';
import { CategoryState } from '../../../../store/state/category.state';

@Component({
  selector: 'app-footer-categories',
  imports: [RouterModule],
  templateUrl: './footer-categories.html',
  styleUrl: './footer-categories.scss',
})
export class FooterCategories {
  private store = inject(Store);

  readonly categoryIds = input<number[]>();

  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.footerCategory);

  public categories: ICategory[];

  ngOnInit() {
    const categoryIds = this.categoryIds();
    this.store.dispatch(
      new GetFooterCategoriesAction({
        status: 1,
        ids: categoryIds?.join(','),
      }),
    );

    if (categoryIds && categoryIds.length) {
      this.category$.subscribe(res => {
        if (res) {
          this.categories = res.data.filter(category => this.categoryIds()?.includes(category.id));
        }
      });
    }
  }
}
