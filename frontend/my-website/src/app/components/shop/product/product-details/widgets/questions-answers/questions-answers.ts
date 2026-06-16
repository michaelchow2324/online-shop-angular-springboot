import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';

import { QuestionModal } from '../../../../../../shared/components/widgets/modal/question-modal/question-modal';
import { NoData } from '../../../../../../shared/components/widgets/no-data/no-data';
import { IAccountUser } from '../../../../../../shared/interface/account.interface';
import { IProduct } from '../../../../../../shared/interface/product.interface';
import { IQuestionAnswers } from '../../../../../../shared/interface/questions-answers.interface';
import { QuestionsAnswerService } from '../../../../../../shared/services/questions-answer.service';
import { GetUserDetailsAction } from '../../../../../../shared/store/action/account.action';
import { FeedbackAction } from '../../../../../../shared/store/action/questions-answers.action';
import { AccountState } from '../../../../../../shared/store/state/account.state';

@Component({
  selector: 'app-questions-answers',
  imports: [TranslateModule, NoData, AsyncPipe],
  templateUrl: './questions-answers.html',
  styleUrl: './questions-answers.scss',
})
export class QuestionsAnswers {
  private store = inject(Store);
  questionAnswersService = inject(QuestionsAnswerService);
  private modal = inject(NgbModal);

  // public user: IAccountUser;
  public question = new FormControl();
  public isLogin: boolean = false;
  public skeletonItems = Array.from({ length: 5 }, (_, index) => index);
  private destroy$ = new Subject<void>();

  readonly product = input<IProduct>();
  readonly questionAnswers = input<IQuestionAnswers[]>();

  // @ViewChild("questionModal") QuestionModal: QuestionModalComponent;

  user$: Observable<IAccountUser> = inject(Store).select(
    AccountState.user,
  ) as Observable<IAccountUser>;

  constructor() {
    this.isLogin = !!this.store.selectSnapshot(state => state.auth && state.auth.access_token);
    if (this.isLogin) {
      this.store.dispatch(new GetUserDetailsAction());
    }
  }

  openModal(product: IProduct, qna?: IQuestionAnswers) {
    if (qna) {
      if (this.isLogin) {
        const qnaModal = this.modal.open(QuestionModal, {
          size: 'm',
          centered: true,
          windowClass: 'theme-modal-2',
        });
        qnaModal.componentInstance.product = product;
        qnaModal.componentInstance.qna = qna;
      }
    } else {
      const qnaModal = this.modal.open(QuestionModal, {
        size: 'm',
        centered: true,
        windowClass: 'theme-modal-2 question-answer-modal',
      });
      qnaModal.componentInstance.product = product;
      qnaModal.componentInstance.qna = qna;
    }
  }

  feedback(qna: IQuestionAnswers, value: string) {
    const data = {
      question_and_answer_id: qna.id,
      reaction: value,
    };
    this.store.dispatch(new FeedbackAction(data, value));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
