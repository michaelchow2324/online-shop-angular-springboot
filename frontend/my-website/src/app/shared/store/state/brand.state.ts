import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IBrand } from '../../interface/brand.interface';
import { BrandService } from '../../services/brand.service';
import { GetBrandBySlugAction, GetBrandsAction } from '../action/brand.action';

export class BrandStateModel {
  brand = {
    data: [] as IBrand[],
    total: 0,
  };
  selectedBrand: IBrand | null;
}

@State<BrandStateModel>({
  name: 'brand',
  defaults: {
    brand: {
      data: [],
      total: 0,
    },
    selectedBrand: null,
  },
})
@Injectable()
export class BrandState {
  private brandService = inject(BrandService);

  @Selector()
  static brand(state: BrandStateModel) {
    return state.brand;
  }

  @Selector()
  static selectedBrand(state: BrandStateModel) {
    return state.selectedBrand;
  }

  @Action(GetBrandsAction)
  getBrands(ctx: StateContext<BrandStateModel>, action: GetBrandsAction) {
    this.brandService.skeletonLoader = true;
    return this.brandService.getBrands(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            brand: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        complete: () => {
          this.brandService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetBrandBySlugAction)
  getBrandBySlug(ctx: StateContext<BrandStateModel>, action: GetBrandBySlugAction) {
    return this.brandService.getBrands().pipe(
      tap({
        next: results => {
          if (results && results.data) {
            const result = results.data.find(brand => brand.slug == action.slug);
            const state = ctx.getState();
            ctx.patchState({
              ...state,
              selectedBrand: result,
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }
}
