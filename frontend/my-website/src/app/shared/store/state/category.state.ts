import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { ICategory } from '../../interface/category.interface';
import { CategoryService } from '../../services/category.service';
import {
  GetCategoriesAction,
  GetCategoryAction,
  GetCategoryBySlugAction,
  GetFooterCategoriesAction,
  GetHeaderCategoriesAction,
  GetProductCategoryAction,
  GetSearchByCategoryAction,
} from '../action/category.action';

export class CategoryStateModel {
  category = {
    data: [] as ICategory[],
    total: 0,
  };
  categories = {
    data: [] as ICategory[],
    total: 0,
  };
  footerCategory = {
    data: [] as ICategory[],
    total: 0,
  };
  headerCategory = {
    data: [] as ICategory[],
    total: 0,
  };
  productCategory = {
    data: [] as ICategory[],
    total: 0,
  };
  searchByCategory: ICategory[];
  selectedCategory: ICategory | null;
}

@State<CategoryStateModel>({
  name: 'category',
  defaults: {
    category: {
      data: [],
      total: 0,
    },
    categories: {
      data: [],
      total: 0,
    },
    footerCategory: {
      data: [],
      total: 0,
    },
    headerCategory: {
      data: [],
      total: 0,
    },
    productCategory: {
      data: [],
      total: 0,
    },
    searchByCategory: [],
    selectedCategory: null,
  },
})
@Injectable()
export class CategoryState {
  private categoryService = inject(CategoryService);

  @Selector()
  static category(state: CategoryStateModel) {
    return state.category;
  }

  @Selector()
  static categories(state: CategoryStateModel) {
    return state.categories;
  }

  @Selector()
  static footerCategory(state: CategoryStateModel) {
    return state.footerCategory;
  }

  @Selector()
  static headerCategory(state: CategoryStateModel) {
    return state.headerCategory;
  }

  @Selector()
  static productCategory(state: CategoryStateModel) {
    return state.productCategory;
  }

  @Selector()
  static subCategory(state: CategoryStateModel) {
    return state.category;
  }

  @Selector()
  static searchByCategory(state: CategoryStateModel) {
    return state.searchByCategory;
  }

  @Selector()
  static selectedCategory(state: CategoryStateModel) {
    return state.selectedCategory;
  }

  @Action(GetCategoriesAction)
  getCategories(ctx: StateContext<CategoryStateModel>, action: GetCategoriesAction) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          if (result && result.data) {
            ctx.patchState({
              categories: {
                data: result.data,
                total: result?.total ? result?.total : result.data.length,
              },
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetCategoryAction)
  getCategory(ctx: StateContext<CategoryStateModel>, action: GetCategoryAction) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          if (result && result.data) {
            ctx.patchState({
              category: {
                data: result.data,
                total: result?.total ? result?.total : result.data.length,
              },
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetFooterCategoriesAction)
  GetFooterCategories(ctx: StateContext<CategoryStateModel>, action: GetFooterCategoriesAction) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          if (result && result.data) {
            ctx.patchState({
              footerCategory: {
                data: result.data,
                total: result?.total ? result?.total : result.data.length,
              },
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetHeaderCategoriesAction)
  GetHeaderCategories(ctx: StateContext<CategoryStateModel>, action: GetHeaderCategoriesAction) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          if (result && result.data) {
            ctx.patchState({
              headerCategory: {
                data: result.data,
                total: result?.total ? result?.total : result.data.length,
              },
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetProductCategoryAction)
  GetProductCategory(ctx: StateContext<CategoryStateModel>, action: GetProductCategoryAction) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            productCategory: {
              data: result.data,
              total: result?.total ? result?.total : result.data.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetSearchByCategoryAction)
  getSearchByCategory(ctx: StateContext<CategoryStateModel>, action: GetSearchByCategoryAction) {
    this.categoryService.searchSkeleton = true;
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          let categories;
          if (action?.payload?.['search']) {
            categories = result.data.filter(category =>
              category.name.toLowerCase().includes(action?.payload?.['search'].toLowerCase()),
            );
          } else {
            categories = result.data;
          }
          ctx.patchState({
            searchByCategory: categories ? categories.splice(0, 4) : [],
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
        complete: () => {
          this.categoryService.searchSkeleton = false;
        },
      }),
    );
  }

  @Action(GetCategoryBySlugAction)
  getCategoryBySlug(ctx: StateContext<CategoryStateModel>, action: GetCategoryBySlugAction) {
    return this.categoryService.getCategories().pipe(
      tap({
        next: results => {
          if (results && results.data) {
            const result = results.data.find(category => category.slug == action.slug);
            const state = ctx.getState();
            ctx.patchState({
              ...state,
              selectedCategory: result,
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  getSubCategory(category: ICategory, ids: number[]) {
    if (ids?.includes(category.id)) {
      if (category) {
        return category;
      }
    }

    if (category.subcategories?.length) {
      category.subcategories.map(subcategory => {
        this.getSubCategory(subcategory, ids);
      });
    }
  }
}
