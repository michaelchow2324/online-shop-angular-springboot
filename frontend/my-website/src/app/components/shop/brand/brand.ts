import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { IBrand } from '../../../shared/interface/brand.interface';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { Params } from '../../../shared/interface/core.interface';
import { IProductModel } from '../../../shared/interface/product.interface';
import { GetProductsAction } from '../../../shared/store/action/product.action';
import { BrandState } from '../../../shared/store/state/brand.state';
import { ProductState } from '../../../shared/store/state/product.state';
import { CollectionProducts } from '../collection/widgets/collection-products/collection-products';

@Component({
  selector: 'app-brand',
  imports: [Breadcrumb, CollectionProducts],
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
})
export class Brand {
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);
  brand$: Observable<IBrand> = inject(Store).select(BrandState.selectedBrand) as Observable<IBrand>;

  public breadcrumb: IBreadcrumb = {
    title: 'Brand',
    items: [{ label: 'Collections', active: false }],
  };
  public layout: string = 'collection_category_slider';
  public skeleton: boolean = true;
  public brand: IBrand;
  public filter: Params = {
    page: 1, // Current page number
    paginate: 40, // Display per page,
    brand: '',
  };

  public totalItems: number = 0;
  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      this.brand$.subscribe(brand => {
        this.brand = brand;
        this.updateBreadcrumb();
        this.updateFilterAndFetchProducts();
      }),
    );

    this.filter['brand'] = this.route.snapshot.paramMap.get('slug');
    this.store.dispatch(new GetProductsAction(this.filter));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private updateBreadcrumb() {
    this.breadcrumb.title = `Brand: ${this.brand?.name}`;
    this.breadcrumb.items[0].label = this.brand?.name;
  }

  private updateFilterAndFetchProducts() {
    if (this.brand) {
      this.filter['brand'] = this.brand.slug;
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
}
