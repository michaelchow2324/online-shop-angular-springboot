import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, PLATFORM_ID, inject, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { forkJoin, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Button } from '../../../shared/components/widgets/button/button';
import { Categories } from '../../../shared/components/widgets/categories/categories';
import { productSlider2, productSlider3 } from '../../../shared/data/owl-carousel';
import { IDigitalDownload } from '../../../shared/interface/theme.interface';
import { ThemeOptionService } from '../../../shared/services/theme-option.service';
import { GetBlogsAction } from '../../../shared/store/action/blog.action';
import { GetCategoriesAction } from '../../../shared/store/action/category.action';
import { GetProductByIdsAction } from '../../../shared/store/action/product.action';
import { ThemeBlog } from '../widgets/theme-blog/theme-blog';
import { ThemeProduct } from '../widgets/theme-product/theme-product';
import { ThemeProductTabSection } from '../widgets/theme-product-tab-section/theme-product-tab-section';
import { ThemeTitle } from '../widgets/theme-title/theme-title';

@Component({
  selector: 'app-digital-download',
  imports: [
    Categories,
    ThemeTitle,
    ThemeProduct,
    ThemeProductTabSection,
    ThemeBlog,
    TranslateModule,
    Button,
    NgClass,
  ],
  templateUrl: './digital-download.html',
  styleUrl: './digital-download.scss',
})
export class DigitalDownload {
  private store = inject(Store);
  private themeOptionService = inject(ThemeOptionService);

  readonly data = input<IDigitalDownload>();
  readonly slug = input<string>();
  private platformId: boolean;
  public productSlider3 = productSlider3;
  public productSlider2 = productSlider2;
  public StorageURL = environment.storageURL;

  constructor() {
    const platformId = inject<Object>(PLATFORM_ID);

    this.platformId = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const data = this.data();
    if (data?.slug == this.slug()) {
      // Get Products
      let getProducts$;
      if (data?.content?.products_ids?.length && data?.content?.products_list?.status) {
        getProducts$ = this.store.dispatch(
          new GetProductByIdsAction({
            status: 1,
            approve: 1,
            ids: data?.content?.products_ids?.join(','),
            paginate: data?.content?.products_ids?.length,
          }),
        );
      } else {
        getProducts$ = of(null);
      }

      // Get Category
      let getCategory$;
      let categoryIds = data?.content.category_product.category_ids.concat(
        data.content.categories_icon_list.category_ids,
      );
      if (categoryIds) {
        getCategory$ = this.store.dispatch(
          new GetCategoriesAction({
            status: 1,
            ids: categoryIds?.join(','),
          }),
        );
      } else {
        getCategory$ = of(null);
      }

      // Get Blog
      let getBlog$;
      if (
        data?.content?.featured_blogs?.blog_ids?.length &&
        data?.content?.featured_blogs?.status
      ) {
        getBlog$ = this.store.dispatch(
          new GetBlogsAction({
            status: 1,
            ids: data?.content?.featured_blogs?.blog_ids?.join(','),
          }),
        );
      } else {
        getBlog$ = of(null);
      }

      // Skeleton Loader
      if (this.platformId) {
        document.body.classList.add('skeleton-body', 'digital-download');
        forkJoin([getProducts$, getCategory$, getBlog$]).subscribe({
          complete: () => {
            document.body.classList.remove('skeleton-body');
            this.themeOptionService.preloader = false;
          },
        });
      }
    }
  }

  ngOnDestroy() {
    // Remove Class
    if (this.platformId) {
      document.body.classList.remove('digital-download');
    }
  }
}
