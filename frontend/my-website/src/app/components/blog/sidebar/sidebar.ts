import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { IBlog } from '../../../shared/interface/blog.interface';
import { ICategory, ICategoryModel } from '../../../shared/interface/category.interface';
import { ITagModel } from '../../../shared/interface/tag.interface';
import { BlogService } from '../../../shared/services/blog.service';
import { GetRecentBlogAction } from '../../../shared/store/action/blog.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetTagsAction } from '../../../shared/store/action/tag.action';
import { BlogState } from '../../../shared/store/state/blog.state';
import { CategoryState } from '../../../shared/store/state/category.state';
import { TagState } from '../../../shared/store/state/tag.state';
import { SkeletonBlog } from '../skeleton-blog/skeleton-blog';
import { BlogCategory } from './blog-category/blog-category';
import { BlogRecentPost } from './blog-recent-post/blog-recent-post';
import { BlogTag } from './blog-tag/blog-tag';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    TranslateModule,
    BlogRecentPost,
    BlogCategory,
    BlogTag,
    SkeletonBlog,
    NoData,
    AsyncPipe,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  blogService = inject(BlogService);
  private store = inject(Store);

  resentBlog$: Observable<IBlog[]> = inject(Store).select(BlogState.resentBlog) as Observable<
    IBlog[]
  >;
  tag$: Observable<ITagModel> = inject(Store).select(TagState.tag) as Observable<ITagModel>;
  category$: Observable<ICategoryModel> = inject(Store).select(
    CategoryState.category,
  ) as Observable<ICategoryModel>;

  public category: ICategory[];

  constructor() {
    this.store.dispatch(new GetTagsAction({ status: 1, type: 'post' }));
    this.store.dispatch(new GetRecentBlogAction({ status: 1, type: 'post', paginate: '5' }));

    this.store.dispatch(new GetCategoriesAction({ status: 1, type: 'post' }));
    this.category$.subscribe(category => {
      this.category = category.data;
    });
  }
}
