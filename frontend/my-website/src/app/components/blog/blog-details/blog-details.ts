import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBlog } from '../../../shared/interface/blog.interface';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { IOption } from '../../../shared/interface/theme-option.interface';
import { SeoService } from '../../../shared/services/seo.service';
import { BlogState } from '../../../shared/store/state/blog.state';
import { ThemeOptionState } from '../../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-blog-details',
  imports: [TranslateModule, Breadcrumb, AsyncPipe, DatePipe],
  templateUrl: './blog-details.html',
  styleUrl: './blog-details.scss',
})
export class BlogDetails {
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  blog$: Observable<IBlog> = inject(Store).select(BlogState.selectedBlog) as Observable<IBlog>;
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: 'Product',
    items: [],
  };

  public sidebar: string;
  public StorageURL = environment.storageURL;

  constructor() {
    this.blog$.subscribe(blog => {
      this.breadcrumb.items = [];
      this.breadcrumb.title = blog.title;
      this.breadcrumb.items.push(
        { label: 'IBlog', active: true },
        { label: blog.title, active: false },
      );
    });

    // For Demo Purpose only
    this.route.queryParams.subscribe(params => {
      if (params['sidebar']) {
        this.sidebar = params['sidebar'];
      } else {
        // Get Blog Layout
        this.themeOption$.subscribe(theme => {
          this.sidebar = theme?.blog.blog_sidebar_type;
        });
      }
    });
  }
}
