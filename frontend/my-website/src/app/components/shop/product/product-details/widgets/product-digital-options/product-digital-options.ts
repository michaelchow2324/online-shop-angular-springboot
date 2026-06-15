import { Component, inject, input } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { VideoModal } from '../../../../../../shared/components/widgets/modal/video-modal/video-modal';
import { IProduct } from '../../../../../../shared/interface/product.interface';

@Component({
  selector: 'app-product-digital-options',
  imports: [TranslateModule],
  templateUrl: './product-digital-options.html',
  styleUrl: './product-digital-options.scss',
})
export class ProductDigitalOptions {
  private modal = inject(NgbModal);

  readonly product = input<IProduct>();

  openModal(url: string, type: string) {
    const modal = this.modal.open(VideoModal, {
      centered: true,
      size: 'lg',
      windowClass: 'theme-modal-2',
    });
    modal.componentInstance.video_url = url;
    modal.componentInstance.type = type;
  }
}
