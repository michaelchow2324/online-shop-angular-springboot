import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { Breadcrumb } from '../../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../../shared/components/widgets/no-data/no-data';
import { compareSlider } from '../../../shared/data/owl-carousel';
import { IBreadcrumb } from '../../../shared/interface/breadcrumb.interface';
import { ICartAddOrUpdate } from '../../../shared/interface/cart.interface';
import { IProduct } from '../../../shared/interface/product.interface';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency.pipe';
import { CompareService } from '../../../shared/services/compare.service';
import { AddToCartAction } from '../../../shared/store/action/cart.action';
import { DeleteCompareAction, GetCompareAction } from '../../../shared/store/action/compare.action';
import { CompareState } from '../../../shared/store/state/compare.state';

@Component({
  selector: 'app-compare',
  imports: [
    TranslateModule,
    NgbModule,
    CarouselModule,
    CurrencySymbolPipe,
    Breadcrumb,
    NoData,
    AsyncPipe,
  ],
  templateUrl: './compare.html',
  styleUrl: './compare.scss',
})
export class Compare {
  private store = inject(Store);
  compareService = inject(CompareService);

  compareItems$: Observable<IProduct[]> = inject(Store).select(CompareState.compareItems);

  public breadcrumb: IBreadcrumb = {
    title: 'Compare',
    items: [{ label: 'Compare', active: true }],
  };

  public skeletonItems = Array.from({ length: 3 }, (_, index) => index);
  public options = compareSlider;

  constructor() {
    this.store.dispatch(new GetCompareAction());
  }

  moveToCart(product: IProduct) {
    if (product) {
      const params: ICartAddOrUpdate = {
        id: null,
        product_id: product?.id,
        product: product ? product : null,
        variation: null,
        variation_id: null,
        quantity: 1,
      };
      this.store.dispatch(new AddToCartAction(params)).subscribe({
        complete: () => {
          this.removeCompare(product.id);
        },
      });
    }
  }

  removeCompare(id: number) {
    this.store.dispatch(new DeleteCompareAction(id));
  }
}
