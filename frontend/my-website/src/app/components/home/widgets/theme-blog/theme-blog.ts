import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { BlogSlider } from '../../../../shared/data/owl-carousel';
import { IBlog, IBlogModel } from '../../../../shared/interface/blog.interface';
import { BlogService } from '../../../../shared/services/blog.service';
import { BlogState } from '../../../../shared/store/state/blog.state';
import { SkeletonBlog } from '../../../blog/skeleton-blog/skeleton-blog';

@Component({
  selector: 'app-theme-blog',
  imports: [CarouselModule, RouterModule, TranslateModule, NoData, SkeletonBlog, DatePipe, NgClass],
  templateUrl: './theme-blog.html',
  styleUrl: './theme-blog.scss',
})
export class ThemeBlog {
  blogService = inject(BlogService);

  blog$: Observable<IBlogModel> = inject(Store).select(BlogState.blog);

  readonly blogIds = input<number[]>([]);
  readonly blogEffect = input<string>();
  readonly type = input<string>();
  readonly option = input<OwlOptions>(BlogSlider);

  public blogs: IBlog[] = [];
  public skeletonItems = Array.from({ length: 5 }, (_, index) => index);
  public StorageURL = environment.storageURL;

  ngOnChanges() {
    if (Array.isArray(this.blogIds())) {
      this.blog$.subscribe(blogs => {
        this.blogs = blogs?.data.filter(blog => this.blogIds()?.includes(blog?.id!));
      });
    }
  }
}
