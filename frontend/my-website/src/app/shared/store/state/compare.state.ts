import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext } from '@ngxs/store';

import { IProduct } from '../../interface/product.interface';
import { CompareService } from '../../services/compare.service';
import {
  AddToCompareAction,
  DeleteCompareAction,
  GetCompareAction,
} from '../action/compare.action';

export class CompareStateModel {
  items: IProduct[];
  total: number;
  comparIds: number[];
}

@State<CompareStateModel>({
  name: 'compare',
  defaults: {
    items: [],
    total: 0,
    comparIds: [],
  },
})
@Injectable()
export class CompareState {
  router = inject(Router);
  private compareService = inject(CompareService);

  @Selector()
  static compareItems(state: CompareStateModel) {
    return state.items;
  }

  @Selector()
  static compareIds(state: CompareStateModel) {
    return state.comparIds;
  }

  @Selector()
  static compareTotal(state: CompareStateModel) {
    return state.total;
  }

  /** No compare.json seed — empty until a real compare API exists. */
  @Action(GetCompareAction)
  getCompareItems(ctx: StateContext<CompareStateModel>) {
    this.compareService.skeletonLoader = false;
    ctx.patchState({
      items: [],
      total: 0,
      comparIds: [],
    });
  }

  @Action(AddToCompareAction)
  add(_ctx: StateContext<CompareStateModel>, _action: AddToCompareAction) {
    // Add compare Logic Here
  }

  @Action(DeleteCompareAction)
  delete(_ctx: StateContext<CompareStateModel>, { id: _id }: DeleteCompareAction) {
    // Delete compare Logic Here
  }
}
