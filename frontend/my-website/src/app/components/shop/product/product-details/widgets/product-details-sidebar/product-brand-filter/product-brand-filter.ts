import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { IBrand } from '../../../../../../../shared/interface/brand.interface';

@Component({
  selector: 'app-product-brand-filter',
  imports: [NgbModule],
  templateUrl: './product-brand-filter.html',
  styleUrl: './product-brand-filter.scss',
})
export class ProductBrandFilter {
  private router = inject(Router);

  readonly brands = input<IBrand[]>();

  applyFilter(value: string | undefined) {
    void this.router.navigate(['/collections'], {
      queryParams: {
        layout: 'collection_left_sidebar',
        brand: value,
        page: 1,
      },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false, // do trigger navigation
    });
  }
}
