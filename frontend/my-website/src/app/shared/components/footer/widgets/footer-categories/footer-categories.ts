import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private destroyRef = inject(DestroyRef);

  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.footerCategory);

  public categories: ICategory[] = [];

  ngOnInit() {
    this.store.dispatch(new GetFooterCategoriesAction({ status: 1 }));

    this.category$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      this.categories = (res?.data || []).filter(
        category =>
          category?.status !== false &&
          category?.slug?.toLowerCase() !== 'test' &&
          category?.name?.trim().toLowerCase() !== 'test',
      );
    });
  }
}
