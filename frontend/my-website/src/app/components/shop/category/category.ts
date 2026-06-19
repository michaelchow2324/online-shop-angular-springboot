import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { filter, Observable, Subscription, switchMap } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICategory } from '../../../shared/interface/category.interface';
import { IProductModel } from '../../../shared/interface/product.interface';
import { GetProductsAction } from '../../../shared/store/action/product.action';
import { CategoryState } from '../../../shared/store/state/category.state';
import { ProductState } from '../../../shared/store/state/product.state';
import { CollectionProducts } from '../collection/widgets/collection-products/collection-products';
// Disabled for now — uncomment when re-enabling filters in category.html
// import { Sidebar } from '../collection/widgets/sidebar/sidebar';

@Component({
  selector: 'app-category',
  imports: [Breadcrumb, CollectionProducts],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class Category {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);
  category$: Observable<ICategory> = inject(Store).select(
    CategoryState.selectedCategory,
  ) as Observable<ICategory>;

  public breadcrumb: IBreadcrumb = {
    title: 'Category',
    items: [{ label: '', active: false }],
  };
  public layout: string = 'collection_category_slider';
  public skeleton: boolean = true;
  public category: ICategory;
  public activeCategory: string | null;
  public filter: Params = {
    page: 1, // Current page number
    paginate: 40, // Display per page,
    status: 1,
    field: 'createdAt',
    price: '',
    category: '',
    tag: '',
    // sort: 'asc', // ASC, DSC
    sortBy: 'asc',
    rating: '',
    attribute: '',
    layout: 'collection_no_sidebar', // hides filter button while sidebar is commented out
  };

  public totalItems: number = 0;
  private routerEventsSubscription: Subscription;

  constructor() {
    this.category$.subscribe(category => {
      this.category = category;
      this.breadcrumb.title = `Category: ${this.category?.name}`;
      this.breadcrumb.items[0].label = this.category?.name;
    });

    const category = this.route.snapshot.paramMap.get('slug');
    this.filter = {
      ...this.filter,
      category: category,
    };
    this.store.dispatch(new GetProductsAction(this.filter));
  }

  ngOnInit() {
    this.routerEventsSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(() => {
          const category = this.route.snapshot.paramMap.get('slug');
          return this.route.queryParams.pipe(
            switchMap(params => {
              this.filter = {
                page: params['page'] ? params['page'] : 1,
                paginate: 40,
                status: 1,
                category: params['category'] ? params['category'] : category,
                price: params['price'] ? params['price'] : '',
                brand: params['brand'] ? params['brand'] : '',
                tag: params['tag'] ? params['tag'] : '',
                field: params['field'] ? params['field'] : this.filter['field'],
                sortBy: params['sortBy'] ? params['sortBy'] : this.filter['sortBy'],
                rating: params['rating'] ? params['rating'] : '',
                attribute: params['attribute'] ? params['attribute'] : '',
                layout: 'collection_no_sidebar',
              };
              this.store.dispatch(new GetProductsAction(this.filter));
              return [];
            }),
          );
        }),
      )
      .subscribe();
  }

  private updateFilterAndFetchProducts() {
    if (this.category) {
      this.filter['category'] = this.category.slug;
    }
    this.store.dispatch(new GetProductsAction(this.filter));
  }

  public changePage(page: number) {
    this.filter['page'] = page;
    this.updateFilterAndFetchProducts();
  }

  public changePaginate(paginate: number) {
    this.filter['paginate'] = paginate;
    this.updateFilterAndFetchProducts();
  }

  ngOnDestroy() {
    if (this.routerEventsSubscription) {
      this.routerEventsSubscription.unsubscribe();
    }
  }
}
