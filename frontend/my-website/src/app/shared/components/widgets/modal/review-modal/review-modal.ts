import { Component, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import { IProduct } from '../../../../interface/product.interface';
import { SendReviewAction, UpdateReviewAction } from '../../../../store/action/review.action';
import { Button } from '../../button/button';

@Component({
  selector: 'app-review-modal',
  imports: [TranslateModule, NgbModule, FormsModule, ReactiveFormsModule, Button],
  templateUrl: './review-modal.html',
  styleUrl: './review-modal.scss',
})
export class ReviewModal {
  modal = inject(NgbActiveModal);
  private store = inject(Store);

  readonly product = input<IProduct>();
  readonly type = input<string>();

  public currentRate: number = 0;
  public review = new FormControl('', [Validators.required]);
  public form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      rating: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });
  }

  ngOnInit() {
    if (this.type() == 'edit') {
      this.form.patchValue({
        rating: this.product()?.user_review.rating,
        description: this.product()?.user_review.description,
      });
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      let data = {
        product_id: this.product()?.id,
        rating: this.form.get('rating')?.value,
        review_image_id: '',
        description: this.form.get('description')?.value,
      };
      let action = new SendReviewAction(data);

      const product = this.product();
      if (this.type() === 'edit' && product!.user_review.id) {
        action = new UpdateReviewAction(product!.user_review.id, data);
      }
      this.store.dispatch(action);
    }
  }
}
