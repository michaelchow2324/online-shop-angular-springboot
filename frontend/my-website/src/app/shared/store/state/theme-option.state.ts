import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IThemeOptionStateModel } from '../../interface/theme-option.interface';
import { ThemeOptionService } from '../../services/theme-option.service';
import {
  ThemeOptionsAction,
  UpdateProductBoxAction,
  UpdateSessionAction,
} from '../action/theme-option.action';

@State<IThemeOptionStateModel>({
  name: 'theme_option',
  defaults: {
    theme_option: null,
    exit: true,
    cookies: true,
    newsletter: true,
    productBox: '',
  },
})
@Injectable()
export class ThemeOptionState {
  private themeOptionService = inject(ThemeOptionService);

  @Selector()
  static themeOptions(state: IThemeOptionStateModel) {
    return state.theme_option;
  }

  @Selector()
  static exit(state: IThemeOptionStateModel) {
    return state.exit;
  }

  @Selector()
  static cookies(state: IThemeOptionStateModel) {
    return state.cookies;
  }

  @Selector()
  static newsletter(state: IThemeOptionStateModel) {
    return state.newsletter;
  }

  @Selector()
  static productBox(state: IThemeOptionStateModel) {
    return state.productBox;
  }

  @Action(ThemeOptionsAction)
  getThemeOptions(ctx: StateContext<IThemeOptionStateModel>) {
    return this.themeOptionService.getThemeOption().pipe(
      tap({
        next: (result: any) => {
          const state = ctx.getState();
          ctx.setState({
            ...state,
            theme_option: result.options,
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(UpdateSessionAction)
  UpdateSession(ctx: StateContext<IThemeOptionStateModel>, action: UpdateSessionAction) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      cookies: action.slug == 'cookies' ? action.value : state.cookies,
      exit: action.slug == 'exit' ? action.value : state.exit,
      newsletter: action.slug == 'newsletter' ? action.value : state.newsletter,
    });
  }

  @Action(UpdateProductBoxAction)
  UpdateProductBox(ctx: StateContext<IThemeOptionStateModel>, action: UpdateProductBoxAction) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      productBox: action.value,
    });
  }
}
