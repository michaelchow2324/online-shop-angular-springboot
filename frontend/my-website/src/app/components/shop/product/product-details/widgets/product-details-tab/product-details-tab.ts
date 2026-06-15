import { AsyncPipe } from '@angular/common';
import { Component, inject, input, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IProduct } from '../../../../../../shared/interface/product.interface';
import { IQnAModel } from '../../../../../../shared/interface/questions-answers.interface';
import { IReviewModel } from '../../../../../../shared/interface/review.interface';
import { GetQuestionAnswersAction } from '../../../../../../shared/store/action/questions-answers.action';
import { GetReviewAction } from '../../../../../../shared/store/action/review.action';
import { QuestionAnswersState } from '../../../../../../shared/store/state/questions-answers.state';
import { ReviewState } from '../../../../../../shared/store/state/review.state';
import { ProductReview } from '../product-review/product-review';
import { QuestionsAnswers } from '../questions-answers/questions-answers';

@Component({
  selector: 'app-product-details-tab',
  imports: [NgbModule, TranslateModule, ProductReview, QuestionsAnswers, AsyncPipe],
  templateUrl: './product-details-tab.html',
  styleUrl: './product-details-tab.scss',
})
export class ProductDetailsTab {
  private store = inject(Store);
  private sanitizer = inject(DomSanitizer);

  question$: Observable<IQnAModel> = inject(Store).select(QuestionAnswersState.questionsAnswers);
  review$: Observable<IReviewModel> = inject(Store).select(ReviewState.review);

  readonly product = input<IProduct | null>();

  public active = 'description';

  ngOnChanges(changes: SimpleChanges) {
    let product = changes['product']?.currentValue;
    this.store.dispatch(new GetReviewAction({ product_id: product.id }));
    this.store.dispatch(new GetQuestionAnswersAction({ product_id: product.id }));
  }

  getTrustedHtml(data?: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(data!);
  }
}
