import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Sidebar } from './sidebar/sidebar';
import { SkeletonBlog } from './skeleton-blog/skeleton-blog';
import { environment } from '../../../environments/environment';
import { Breadcrumb } from '../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../shared/components/widgets/pagination/pagination';
import { IBlog, IBlogModel } from '../../shared/interface/blog.interface';
import { IBreadcrumb } from '../../shared/interface/breadcrumb.interface';
import { IOption } from '../../shared/interface/theme-option.interface';
import { BlogService } from '../../shared/services/blog.service';
import { GetBlogsAction } from '../../shared/store/action/blog.action';
import { BlogState } from '../../shared/store/state/blog.state';
import { ThemeOptionState } from '../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-blog',
  imports: [
    RouterModule,
    TranslateModule,
    Sidebar,
    Breadcrumb,
    NoData,
    SkeletonBlog,
    Pagination,
    AsyncPipe,
    DatePipe,
  ],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  blogService = inject(BlogService);
  private router = inject(Router);

  blog$: Observable<IBlogModel> = inject(Store).select(BlogState.blog) as Observable<IBlogModel>;
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: 'Blogs',
    items: [],
  };

  public filter = {
    page: 1, // Current page number
    paginate: 12, // Display per page,
    status: 1,
    category: '',
    tag: '',
  };

  public skeletonItems = Array.from({ length: 9 }, (_, index) => index);
  public totalItems: number = 0;
  public blogsArray: IBlog[];
  public paginateBlog: IBlog[];

  public style: string;
  public sidebar: string = 'left_sidebar';
  public StorageURL = environment.storageURL;

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.filter.category = params['category'] ? params['category'] : '';
      this.filter.tag = params['tag'] ? params['tag'] : '';

      this.breadcrumb.items = [];
      this.breadcrumb.title = this.filter.category
        ? `Blogs: ${this.filter.category.replaceAll('-', ' ')}`
        : this.filter.tag
          ? `Blogs: ${this.filter.tag.replaceAll('-', ' ')}`
          : 'Blogs';
      this.breadcrumb.items.push({ label: 'Blogs', active: true });

      this.store.dispatch(new GetBlogsAction(this.filter));

      // For Demo Purpose only
      if (params['style']) {
        this.style = params['style'];
      }

      if (params['sidebar']) {
        this.sidebar = params['sidebar'];
      }

      if (!params['style'] && !params['sidebar']) {
        // Get Blog Layout
        this.themeOption$.subscribe(theme => {
          this.style = theme?.blog?.blog_style;
          this.sidebar = theme?.blog.blog_sidebar_type;
        });
      }
    });
    this.blog$.subscribe(blog => (this.totalItems = blog?.total));
    this.setPage();
  }

  setPaginate(data: number) {
    this.filter.page = data;
    this.store.dispatch(new GetBlogsAction(this.filter));
  }

  setPage() {
    this.blog$.subscribe(res => {
      this.blogsArray = res.data;
      this.paginateBlog = this.blogsArray
        .map(product => ({ ...product }))
        .slice(
          (this.filter!['page'] - 1) * this.filter['paginate'],
          (this.filter!['page'] - 1) * this.filter['paginate'] + this.filter['paginate'],
        );
    });

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.filter!['page'],
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
