import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-blog',
  imports: [],
  templateUrl: './skeleton-blog.html',
  styleUrl: './skeleton-blog.scss',
})
export class SkeletonBlog {
  readonly type = input<string>('grid');
}
