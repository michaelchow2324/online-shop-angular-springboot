import { NgClass } from '@angular/common';
import { Component, inject, input, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IProduct } from '../../../interface/product.interface';
import { resolveMediaUrl } from '../../../utils/resolve-media-url';
import { ProductState } from '../../../store/state/product.state';

@Component({
  selector: 'app-image-link',
  imports: [RouterModule, NgClass],
  templateUrl: './image-link.html',
  styleUrl: './image-link.scss',
})
export class ImageLink {
  product$: Observable<IProduct[]> = inject(Store).select(ProductState.productByIds);

  readonly image = input<any>();
  readonly bgImage = input<boolean>();
  readonly class = input<string>();
  readonly banner_details = input<boolean>(false);
  readonly placeholder = input<string>();

  mediaUrl = resolveMediaUrl;

  ngOnChanges(change: SimpleChanges) {
    if (
      change['image']?.currentValue &&
      typeof change['image']?.currentValue?.redirect_link?.link === 'number'
    ) {
      this.product$.subscribe(res => {
        res.map(product => {
          if (product.id === change['image']?.currentValue?.redirect_link?.link) {
            this.image()['product_slug'] = product.slug;
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
