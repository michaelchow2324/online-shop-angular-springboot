import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IQuestionAnswers } from '../../interface/questions-answers.interface';
import { QuestionsAnswerService } from '../../services/questions-answer.service';
import {
  GetQuestionAnswersAction,
  SendQuestionAction,
  UpdateQuestionAnswersAction,
  FeedbackAction,
} from '../action/questions-answers.action';

export class QuestionStateModel {
  question = {
    data: [] as IQuestionAnswers[],
    total: 0,
  };
}

@State<QuestionStateModel>({
  name: 'question',
  defaults: {
    question: {
      data: [],
      total: 0,
    },
  },
})
@Injectable()
export class QuestionAnswersState {
  private questionsAnswersService = inject(QuestionsAnswerService);

  @Selector()
  static questionsAnswers(state: QuestionStateModel) {
    return state.question;
  }

  @Action(GetQuestionAnswersAction)
  getQuestionAnswers(ctx: StateContext<QuestionStateModel>, action: GetQuestionAnswersAction) {
    this.questionsAnswersService.skeletonLoader = true;
    return this.questionsAnswersService.getQuestionAnswers(action.slug).pipe(
      tap({
        next: results => {
          const result = results.data.filter(qna => qna.product_id == action.slug['product_id']);
          ctx.patchState({
            question: {
              data: result,
              total: result?.length,
            },
          });
        },
        complete: () => {
          this.questionsAnswersService.skeletonLoader = false;
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(SendQuestionAction)
  sendQuestion(_ctx: StateContext<QuestionStateModel>, _action: SendQuestionAction) {
    // Submit Question Logic Here
  }

  @Action(UpdateQuestionAnswersAction)
  update(
    _ctx: StateContext<QuestionStateModel>,
    { payload: _payload, id: _id }: UpdateQuestionAnswersAction,
  ) {
    // Update Question Logic Here
  }

  @Action(FeedbackAction)
  Feedback(_ctx: StateContext<QuestionStateModel>, _action: FeedbackAction) {
    // Feedback Logic Here
  }
}
