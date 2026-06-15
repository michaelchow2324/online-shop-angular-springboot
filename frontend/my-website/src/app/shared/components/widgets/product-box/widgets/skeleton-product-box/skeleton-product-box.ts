import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-product-box',
  imports: [],
  templateUrl: './skeleton-product-box.html',
  styleUrl: './skeleton-product-box.scss',
})
export class SkeletonProductBox {
  readonly style = input<string>();
}
