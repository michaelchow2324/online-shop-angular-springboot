import { Component, input } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { IVideo } from '../../../shared/interface/theme.interface';

@Component({
  selector: 'app-video',
  templateUrl: './video.html',
  styleUrl: './video.scss',
})
export class Video {
  readonly data = input<IVideo>();
  readonly slug = input<string>();

  public StorageURL = environment.storageURL;
}
