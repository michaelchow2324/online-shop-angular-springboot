import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext } from '@ngxs/store';

import { IProduct } from '../../interface/product.interface';
import { WishlistService } from '../../services/wishlist.service';
import {
  GetWishlistAction,
  AddToWishlistAction,
  DeleteWishlistAction,
} from '../action/wishlist.action';

export class WishlistStateModel {
  wishlist = {
    data: [] as IProduct[],
    total: 0,
  };
  wishlistIds: number[];
}

@State<WishlistStateModel>({
  name: 'wishlist',
  defaults: {
    wishlist: {
      data: [],
      total: 0,
    },
    wishlistIds: [],
  },
})
@Injectable()
export class WishlistState {
  router = inject(Router);
  private wishlistService = inject(WishlistService);

  @Selector()
  static wishlistItems(state: WishlistStateModel) {
    return state.wishlist;
  }

  @Selector()
  static wishlistIds(state: WishlistStateModel) {
    return state.wishlistIds;
  }

  /** No wishlist.json seed — empty until a real wishlist API exists. */
  @Action(GetWishlistAction)
  getWishlistItems(ctx: StateContext<WishlistStateModel>) {
    this.wishlistService.skeletonLoader = false;
    ctx.patchState({
      wishlist: { data: [], total: 0 },
      wishlistIds: [],
    });
  }

  @Action(AddToWishlistAction)
  add(_ctx: StateContext<WishlistStateModel>, _action: AddToWishlistAction) {
    void this.router.navigate(['/wishlist']);
  }

  @Action(DeleteWishlistAction)
  delete(ctx: StateContext<WishlistStateModel>, { id }: DeleteWishlistAction) {
    const state = ctx.getState();
    let item = state.wishlist.data.filter(value => value.id !== id);
    ctx.patchState({
      wishlist: {
        data: item,
        total: Math.max(0, state.wishlist.total - 1),
      },
    });
  }
}
