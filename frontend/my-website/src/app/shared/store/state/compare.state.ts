import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs';

import { IProduct } from '../../interface/product.interface';
import { AuthService } from '../../services/auth.service';
import { CompareService } from '../../services/compare.service';
import { NotificationService } from '../../services/notification.service';
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
  private store = inject(Store);
  router = inject(Router);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);
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

  @Action(GetCompareAction)
  getCompareItems(ctx: StateContext<GetCompareAction>) {
    if (!this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
      return;
    }
    this.compareService.skeletonLoader = true;
    return this.compareService.getComparItems().pipe(
      tap({
        next: result => {
          let ids = result.data.map(product => product.id);
          ctx.patchState({
            items: result.data,
            total: result?.total ? result?.total : result.data?.length,
            comparIds: ids,
          });
        },
        complete: () => {
          this.compareService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
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
