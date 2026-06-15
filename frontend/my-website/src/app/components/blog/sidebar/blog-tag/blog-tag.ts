import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ITag } from '../../../../shared/interface/tag.interface';

@Component({
  selector: 'app-blog-tag',
  imports: [RouterModule],
  templateUrl: './blog-tag.html',
  styleUrl: './blog-tag.scss',
})
export class BlogTag {
  readonly tags = input<ITag[]>();
}
