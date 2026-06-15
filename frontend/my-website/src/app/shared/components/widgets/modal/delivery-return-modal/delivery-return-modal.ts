import { Component, inject, input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { Button } from '../../button/button';

@Component({
  selector: 'app-delivery-return-modal',
  imports: [TranslateModule, Button],
  templateUrl: './delivery-return-modal.html',
  styleUrl: './delivery-return-modal.scss',
})
export class DeliveryReturnModal {
  modal = inject(NgbActiveModal);

  readonly policy = input<string>();
}
