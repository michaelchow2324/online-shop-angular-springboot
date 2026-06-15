import { AsyncPipe, NgClass } from '@angular/common';
import { Component, inject, input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IProduct } from '../../../interface/product.interface';
import { LoaderState } from '../../../store/state/loader.state';
import { ProductState } from '../../../store/state/product.state';

@Component({
  selector: 'app-button',
  imports: [RouterModule, AsyncPipe, NgClass],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly class = input<string>();
  readonly iconClass = input<string | null>();
  readonly id = input<string>();
  readonly label = input<string>();
  readonly type = input<string>('submit');
  readonly spinner = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly data = input<any>();

  public buttonId: string | null;

  spinnerStatus$: Observable<boolean> = inject(Store).select(
    LoaderState.buttonSpinner,
  ) as Observable<boolean>;
  product$: Observable<IProduct[]> = inject(Store).select(ProductState.productByIds);

  constructor() {
    this.spinnerStatus$.subscribe(res => {
      if (res == false) {
        this.buttonId = null;
      }
    });
  }

  public onClick(id: string) {
    this.buttonId = id;
  }

  ngOnChanges(change: SimpleChanges) {
    if (
      change['data']?.currentValue &&
      typeof change['data']?.currentValue?.redirect_link?.link === 'number'
    ) {
      this.product$.subscribe(res => {
        res.map(product => {
          if (product.id === change['data']?.currentValue?.redirect_link?.link) {
            this.data()['product_slug'] = product.slug;
          }
        });
      });
    }
  }

  getProductSlug(id: number, products: IProduct[]) {
    let product = products.find(product => {
      product.id === id;
    });
    return product ? product.slug : null;
  }
}
