import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable, Subscription, debounceTime, distinctUntilChanged, interval } from 'rxjs';

import { ICategory } from '../../../../interface/category.interface';
import { Params } from '../../../../interface/core.interface';
import { IProduct } from '../../../../interface/product.interface';
import { CategoryService } from '../../../../services/category.service';
import { ProductService } from '../../../../services/product.service';
import { GetSearchByCategoryAction } from '../../../../store/action/category.action';
import { GetProductBySearchAction } from '../../../../store/action/product.action';
import { CategoryState } from '../../../../store/state/category.state';
import { ProductState } from '../../../../store/state/product.state';
import { Button } from '../../button/button';
import { NoData } from '../../no-data/no-data';
import { ProductBox } from '../../product-box/product-box';
import { SkeletonProductBox } from '../../product-box/widgets/skeleton-product-box/skeleton-product-box';

@Component({
  selector: 'app-search-modal',
  imports: [
    ProductBox,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
    SkeletonProductBox,
    NoData,
    RouterModule,
    AsyncPipe,
  ],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.scss',
})
export class SearchModal {
  private store = inject(Store);
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  modal = inject(NgbActiveModal);
  router = inject(Router);

  productBySearch$: Observable<IProduct[]> = inject(Store).select(ProductState.productBySearch);
  searchCategory$: Observable<ICategory[]> = inject(Store).select(CategoryState.searchByCategory);

  public products: IProduct[];
  public skeletonItems = Array.from({ length: 4 }, (_, index) => index);

  public search = new FormControl();
  public filter: Params = {
    page: 1, // Current page number
    paginate: 4, // Display per page,
    status: 1,
    search: '',
  };
  public textToType = 'Search with brands and categories...';
  public typedText = '';
  public animationSubscription: Subscription | undefined;

  constructor() {
    this.store.dispatch(new GetProductBySearchAction(this.filter));
    this.productBySearch$.subscribe(product => {
      this.products = product;
    });

    this.store.dispatch(new GetSearchByCategoryAction({ status: 1, paginate: 4 }));
  }

  ngOnInit() {
    this.startTypingAnimation();
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged()) // Adjust the debounce time as needed (in milliseconds)
      .subscribe(inputValue => {
        this.filter['search'] = inputValue;
        this.store.dispatch(
          new GetSearchByCategoryAction({ status: 1, paginate: 4, search: inputValue }),
        );
        this.store.dispatch(new GetProductBySearchAction(this.filter));
        this.productBySearch$.subscribe(product => {
          this.products = product;
        });
      });
  }

  startTypingAnimation() {
    const charactersArray = this.textToType.split('');
    let currentIndex = 0;
    let eraseMode = false;

    this.animationSubscription = interval(150).subscribe(() => {
      if (!eraseMode) {
        if (currentIndex < charactersArray.length) {
          this.typedText += charactersArray[currentIndex];
          currentIndex++;
        } else {
          eraseMode = true;
        }
      } else {
        if (this.typedText.length > 0) {
          this.typedText = this.typedText.slice(0, -1);
        } else {
          eraseMode = false;
          currentIndex = 0;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe();
    }
  }
}
