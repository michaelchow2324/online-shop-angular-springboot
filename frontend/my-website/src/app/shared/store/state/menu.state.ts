import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IMenu } from '../../interface/menu.interface';
import { MenuService } from '../../services/menu.service';
import { GetMenuAction } from '../action/menu.action';

export class MenuStateModel {
  menu = {
    data: [] as IMenu[],
    total: 0,
  };
}

@State<MenuStateModel>({
  name: 'menu',
  defaults: {
    menu: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class MenuState {
  private menuService = inject(MenuService);

  @Selector()
  static menu(state: MenuStateModel) {
    return state.menu;
  }

  @Action(GetMenuAction)
  getMenu(ctx: StateContext<MenuStateModel>, action: GetMenuAction) {
    this.menuService.skeletonLoader = true;
    return this.menuService.getMenu(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            menu: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
        complete: () => {
          this.menuService.skeletonLoader = false;
        },
      }),
    );
  }
}
