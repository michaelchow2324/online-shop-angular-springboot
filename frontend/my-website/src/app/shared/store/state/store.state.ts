import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IStores } from '../../interface/store.interface';
import { StoreService } from '../../services/store.service';
import { GetStoreBySlugAction, GetStoresAction } from '../action/store.action';

export class StoreStateModel {
  store = {
    data: [] as IStores[],
    total: 0,
  };
  selectedStore: IStores | null;
}

@State<StoreStateModel>({
  name: 'store',
  defaults: {
    store: {
      data: [],
      total: 0,
    },
    selectedStore: null,
  },
})
@Injectable()
export class StoreState {
  private storeService = inject(StoreService);
  private router = inject(Router);

  @Selector()
  static store(state: StoreStateModel) {
    return state.store;
  }

  @Selector()
  static selectedStore(state: StoreStateModel) {
    return state.selectedStore;
  }

  @Action(GetStoresAction)
  getStores(ctx: StateContext<StoreStateModel>, action: GetStoresAction) {
    this.storeService.skeletonLoader = true;
    return this.storeService.getStores(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            store: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        complete: () => {
          this.storeService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetStoreBySlugAction)
  getStoreBySlug(ctx: StateContext<StoreStateModel>, { slug }: GetStoreBySlugAction) {
    return this.storeService.getStores().pipe(
      tap({
        next: results => {
          if (results && results.data) {
            const state = ctx.getState();
            const result = results.data.find(store => store.slug == slug);

            ctx.patchState({
              ...state,
              selectedStore: result,
            });
          }
        },
        error: err => {
          void this.router.navigate(['/404']);
          throw new Error(err?.error?.message);
        },
      }),
    );
  }
}
