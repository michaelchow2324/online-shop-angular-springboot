import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Button } from '../../../../../../shared/components/widgets/button/button';
import { ReviewModal } from '../../../../../../shared/components/widgets/modal/review-modal/review-modal';
import { NoData } from '../../../../../../shared/components/widgets/no-data/no-data';
import { IProduct } from '../../../../../../shared/interface/product.interface';
import { IReview } from '../../../../../../shared/interface/review.interface';

@Component({
  selector: 'app-product-review',
  imports: [TranslateModule, NgbModule, NoData, Button, DatePipe],
  templateUrl: './product-review.html',
  styleUrl: './product-review.scss',
})
export class ProductReview {
  private modal = inject(NgbModal);

  readonly product = input<IProduct | null>();
  readonly reviews = input<IReview[]>([]);

  openModal(product: IProduct, type: string) {
    const reviewModal = this.modal.open(ReviewModal, {
      size: 'm',
      centered: true,
      windowClass: 'theme-modal-2 review-modal',
    });
    reviewModal.componentInstance.product = product;
    reviewModal.componentInstance.type = type;
  }
}
