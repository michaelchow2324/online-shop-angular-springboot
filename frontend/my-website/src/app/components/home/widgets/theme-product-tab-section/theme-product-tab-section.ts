import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable, Subscription } from 'rxjs';

import { NoData } from '../../../../shared/components/widgets/no-data/no-data';
import { ProductBox } from '../../../../shared/components/widgets/product-box/product-box';
import { SkeletonProductBox } from '../../../../shared/components/widgets/product-box/widgets/skeleton-product-box/skeleton-product-box';
import { productSlider4 } from '../../../../shared/data/owl-carousel';
import { ICategory, ICategoryModel } from '../../../../shared/interface/category.interface';
import { Params } from '../../../../shared/interface/core.interface';
import { IProduct } from '../../../../shared/interface/product.interface';
import { IProductTabSection } from '../../../../shared/interface/theme.interface';
import { ProductService } from '../../../../shared/services/product.service';
import { GetCategoryProductsAction } from '../../../../shared/store/action/product.action';
import { CategoryState } from '../../../../shared/store/state/category.state';
import { ProductState } from '../../../../shared/store/state/product.state';

@Component({
  selector: 'app-theme-product-tab-section',
  imports: [
    ProductBox,
    CarouselModule,
    NoData,
    SkeletonProductBox,
    TranslateModule,
    AsyncPipe,
    NgClass,
  ],
  templateUrl: './theme-product-tab-section.html',
  styleUrl: './theme-product-tab-section.scss',
})
export class ThemeProductTabSection {
  private store = inject(Store);
  productService = inject(ProductService);

  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.category);
  product$: Observable<IProduct[]> = inject(Store).select(ProductState.categoryProducts);

  readonly categoryIds = input<number[]>();
  readonly slider = input<boolean>(false);
  readonly style = input<string>();
  readonly tab_title_class = input<string>();
  readonly tab_style = input<string>();
  readonly showItems = input<number>(4);
  readonly class = input<string>('row row-cols-xl-4 row-cols-md-3 row-cols-2 g-md-4 g-3');
  readonly type = input<string>();
  readonly title = input<IProductTabSection>();
  readonly product_box_style = input<string>();
  readonly options = input<OwlOptions>(productSlider4);

  // public skeletonItems = Array.from({ length: this.showItems ? this.showItems : this.showItems ? this.showItems : 4 }, (_, index) => index);
  public skeletonItems = Array.from({ length: this.showItems() ?? 4 }, (_, index) => index);

  public categories: ICategory[];
  public categoryProduct: ICategory[];
  public activeCategory: number;
  private categorySubscription: Subscription;

  public filter: Params = {
    page: 1, // Current page number
    paginate: 4, // Display per page,
    status: 1,
    category_id: '',
  };

  ngOnChanges() {
    // Get Category
    this.filter['paginate'] = this.showItems();
    const showItemsValue = this.showItems();
    this.skeletonItems = Array.from(
      { length: showItemsValue ? showItemsValue : showItemsValue ? showItemsValue : 4 },
      (_, index) => index,
    );
    const categoryIds = this.categoryIds();
    if (categoryIds && categoryIds.length) {
      this.categorySubscription = this.category$.subscribe(res => {
        if (res) {
          this.categories = this.getCategoriesByIds(res.data, this.categoryIds()!);

          if (this.categories.length) {
            this.activeCategory = this.categories[0].id;

            this.filter['category_id'] = this.categories[0].id;

            if (this.filter['category_id']) {
              this.store.dispatch(new GetCategoryProductsAction(this.filter));
            }
          }
        }
      });
    }
  }

  getCategoriesByIds(categories: ICategory[], ids: number[]): ICategory[] {
    let matchedCategories: ICategory[] = [];

    categories.forEach(category => {
      if (ids.includes(category.id)) {
        matchedCategories.push(category);
      }

      if (category.subcategories?.length) {
        const matchedSubcategories = this.getCategoriesByIds(category.subcategories, ids);
        if (matchedSubcategories.length) {
          matchedCategories.push(...matchedSubcategories);
        }
      }
    });

    return matchedCategories;
  }

  changeTab(value: ICategory) {
    this.activeCategory = value.id;

    ((this.filter['category_id'] = value.id),
      this.store.dispatch(new GetCategoryProductsAction(this.filter)));
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }
}
