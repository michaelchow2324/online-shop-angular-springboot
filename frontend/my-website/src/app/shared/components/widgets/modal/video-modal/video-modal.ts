import { Component, inject, input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../../../environments/environment';
import { Button } from '../../button/button';

@Component({
  selector: 'app-video-modal',
  imports: [Button],
  templateUrl: './video-modal.html',
  styleUrl: './video-modal.scss',
})
export class VideoModal {
  modal = inject(NgbActiveModal);

  readonly video_url = input<string>();
  readonly type = input<string>();

  public StorageURL = environment.storageURL;
}
