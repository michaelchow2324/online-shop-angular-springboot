import { Component, inject, input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { IAttachment } from '../../../../interface/attachment.interface';
import { Button } from '../../button/button';

@Component({
  selector: 'app-size-chart-modal',
  imports: [TranslateModule, Button],
  templateUrl: './size-chart-modal.html',
  styleUrl: './size-chart-modal.scss',
})
export class SizeChartModal {
  modal = inject(NgbActiveModal);

  readonly image = input<IAttachment>();
}
