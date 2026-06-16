import { Component, inject, input } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IProduct } from '../../../../../../interface/product.interface';
import { ProductDetailsModal } from '../../../../modal/product-details-modal/product-details-modal';

@Component({
  selector: 'app-quick-view',
  imports: [],
  templateUrl: './quick-view.html',
  styleUrl: './quick-view.scss',
})
export class QuickView {
  private modal = inject(NgbModal);

  readonly product = input<IProduct>();
  readonly class = input<string>();

  openModal(product: IProduct) {
    const modal = this.modal.open(ProductDetailsModal, {
      centered: true,
      size: 'lg',
      windowClass: 'theme-modal-2 quick-view-modal',
    });
    modal.componentInstance.product = product;
  }
}
