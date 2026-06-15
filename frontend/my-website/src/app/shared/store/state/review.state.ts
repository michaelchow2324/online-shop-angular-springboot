import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IReview } from '../../interface/review.interface';
import { ReviewService } from '../../services/review.service';
import { GetReviewAction, SendReviewAction, UpdateReviewAction } from '../action/review.action';

export class ReviewStateModel {
  review = {
    data: [] as IReview[] | [],
    total: 0,
  };
}

@State<ReviewStateModel>({
  name: 'review',
  defaults: {
    review: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class ReviewState {
  private reviewsService = inject(ReviewService);

  @Selector()
  static review(state: ReviewStateModel) {
    return state.review;
  }

  @Action(GetReviewAction)
  getReview(ctx: StateContext<ReviewStateModel>, action: GetReviewAction) {
    return this.reviewsService.getReview(action.payload).pipe(
      tap({
        next: results => {
          const result = results.data.filter(
            review => review.product_id == action.payload['product_id'],
          );
          ctx.patchState({
            review: {
              data: result,
              total: result?.length,
            },
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(SendReviewAction)
  sendReview(_ctx: StateContext<ReviewStateModel>, _action: SendReviewAction) {
    // Submit Review Logic Here
  }

  @Action(UpdateReviewAction)
  update(_ctx: StateContext<ReviewStateModel>, { payload: _payload, id: _id }: UpdateReviewAction) {
    // Update Review Logic Here
  }
}
