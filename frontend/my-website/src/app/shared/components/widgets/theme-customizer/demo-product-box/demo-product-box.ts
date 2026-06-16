import { Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { UpdateProductBoxAction } from '../../../../store/action/theme-option.action';
import { ThemeOptionState } from '../../../../store/state/theme-option.state';

@Component({
  selector: 'app-demo-product-box',
  imports: [TranslateModule],
  templateUrl: './demo-product-box.html',
  styleUrl: './demo-product-box.scss',
})
export class DemoProductBox {
  private store = inject(Store);

  productBox$: Observable<string> = inject(Store).select(ThemeOptionState.productBox);

  public productBox = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
  ];
  public variant: string;

  constructor() {
    this.productBox$.subscribe(res => (this.variant = res));
  }

  selectProductBox(number: string) {
    this.store.dispatch(new UpdateProductBoxAction(`product_box_${number}`));
    this.variant = `product_box_${number}`;
  }
}
