import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IProduct } from '../../../../../../interface/product.interface';
import { AddToCompareAction } from '../../../../../../store/action/compare.action';
import { CompareState } from '../../../../../../store/state/compare.state';

@Component({
  selector: 'app-compare',
  imports: [TranslateModule, RouterModule],
  templateUrl: './compare.html',
  styleUrl: './compare.scss',
})
export class Compare {
  private store = inject(Store);

  compareItems$: Observable<IProduct[]> = inject(Store).select(CompareState.compareItems);

  readonly product = input<IProduct>();
  readonly text = input<string>('');

  addToCompare(product: IProduct) {
    this.store.dispatch(new AddToCompareAction({ product: product }));
  }
}
