import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IFaq, IPage, IContactUsModel } from '../../interface/page.interface';
import { PageService } from '../../services/page.service';
import {
  GetFaqsAction,
  GetPageBySlugAction,
  GetPagesAction,
  ContactUsAction,
} from '../action/page.action';

export class PageStateModel {
  page = {
    data: [] as IPage[],
    total: 0,
  };
  faq = {
    data: [] as IFaq[],
    total: 0,
  };
  selectedPage: IPage | null;
}

@State<PageStateModel>({
  name: 'page',
  defaults: {
    page: {
      data: [],
      total: 0,
    },
    faq: {
      data: [],
      total: 0,
    },
    selectedPage: null,
  },
})
@Injectable()
export class PageState {
  private pageService = inject(PageService);

  @Selector()
  static page(state: PageStateModel) {
    return state.page;
  }

  @Selector()
  static faq(state: PageStateModel) {
    return state.faq;
  }

  @Selector()
  static selectedPage(state: PageStateModel) {
    return state.selectedPage;
  }

  @Action(GetPagesAction)
  getPages(ctx: StateContext<PageStateModel>, action: GetPagesAction) {
    return this.pageService.getPages(action.payload).pipe(
      tap({
        next: result => {
          ctx.patchState({
            page: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetPageBySlugAction)
  getPageBySlug(ctx: StateContext<PageStateModel>, { slug }: GetPageBySlugAction) {
    this.pageService.skeletonLoader = true;
    return this.pageService.getPages().pipe(
      tap({
        next: results => {
          if (results && results.data) {
            const state = ctx.getState();
            const result = results.data.find(page => page.slug == slug);

            ctx.patchState({
              ...state,
              selectedPage: result,
            });
          }
        },
        complete: () => {
          this.pageService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(GetFaqsAction)
  getFaqs(ctx: StateContext<PageStateModel>) {
    this.pageService.skeletonLoader = true;
    return this.pageService.getFaqs().pipe(
      tap({
        next: result => {
          ctx.patchState({
            faq: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length,
            },
          });
        },
        complete: () => {
          this.pageService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(ContactUsAction)
  contactUs(_ctx: StateContext<IContactUsModel>, { payload: _payload }: ContactUsAction) {
    // contact api logic here
  }
}
