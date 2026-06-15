import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs';

import { IProduct } from '../../interface/product.interface';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
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
  private store = inject(Store);
  router = inject(Router);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  @Selector()
  static wishlistItems(state: WishlistStateModel) {
    return state.wishlist;
  }

  @Selector()
  static wishlistIds(state: WishlistStateModel) {
    return state.wishlistIds;
  }

  @Action(GetWishlistAction)
  getWishlistItems(ctx: StateContext<GetWishlistAction>) {
    this.wishlistService.skeletonLoader = true;
    // if(!this.store.selectSnapshot(state => state.auth && state.auth.access_token)) {
    //   return;
    // }
    return this.wishlistService.getWishlistItems().pipe(
      tap({
        next: result => {
          let ids = result.data.map(product => product.id);
          ctx.patchState({
            wishlist: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
            wishlistIds: ids,
          });
        },
        complete: () => {
          this.wishlistService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(AddToWishlistAction)
  add(_ctx: StateContext<WishlistStateModel>, _action: AddToWishlistAction) {
    // Add Wishlist Logic Here
    void this.router.navigate(['/wishlist']);
  }

  @Action(DeleteWishlistAction)
  delete(ctx: StateContext<WishlistStateModel>, { id }: DeleteWishlistAction) {
    const state = ctx.getState();
    let item = state.wishlist.data.filter(value => value.id !== id);
    ctx.patchState({
      wishlist: {
        data: item,
        total: state.wishlist.total - 1,
      },
    });
  }
}
