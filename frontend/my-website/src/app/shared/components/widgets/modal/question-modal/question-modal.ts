import { Component, inject, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { IProduct } from '../../../../interface/product.interface';
import { IQuestionAnswers } from '../../../../interface/questions-answers.interface';
import { CurrencySymbolPipe } from '../../../../pipe/currency.pipe';
import {
  SendQuestionAction,
  UpdateQuestionAnswersAction,
} from '../../../../store/action/questions-answers.action';
import { Button } from '../../button/button';

@Component({
  selector: 'app-question-modal',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, CurrencySymbolPipe, Button],
  templateUrl: './question-modal.html',
  styleUrl: './question-modal.scss',
})
export class QuestionModal {
  store = inject(Store);
  modal = inject(NgbActiveModal);

  readonly product = input<IProduct>();
  readonly qna = input<IQuestionAnswers>();

  public question = new FormControl();
  public type = 'crate';
  public id: number;

  ngOnInit() {
    const qna = this.qna();
    if (qna) {
      this.type = 'edit';
      this.id = qna.id;
      this.question.patchValue(qna.question);
    }
  }

  submit() {
    let data = {
      question: this.question.value,
      product_id: this.product()?.id,
      answer: '',
    };
    let action = new SendQuestionAction(data);
    if (data.question || data.product_id) {
      if (this.type == 'edit' && this.id) {
        action = new UpdateQuestionAnswersAction(data, this.id);
      }
      this.store.dispatch(action).subscribe({
        complete: () => {
          this.modal.close();
        },
      });
    }
  }
}
