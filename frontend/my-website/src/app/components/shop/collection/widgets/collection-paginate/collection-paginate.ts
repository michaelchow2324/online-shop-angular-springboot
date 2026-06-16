import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Pagination } from '../../../../../shared/components/widgets/pagination/pagination';
import { IProductModel } from '../../../../../shared/interface/product.interface';
import { PaginationService } from '../../../../../shared/services/pagination.service';
import { ProductState } from '../../../../../shared/store/state/product.state';

@Component({
  selector: 'app-collection-paginate',
  imports: [TranslateModule, Pagination, AsyncPipe],
  templateUrl: './collection-paginate.html',
  styleUrl: './collection-paginate.scss',
})
export class CollectionPaginate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public paginationService = inject(PaginationService);

  product$: Observable<IProductModel> = inject(Store).select(ProductState.product);

  @Input() filter: Params;

  public totalItems: number = 0;

  constructor() {
    this.product$.subscribe(product => (this.totalItems = product?.total));
  }

  setPaginate(page: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: page,
      },
      queryParamsHandling: 'merge',
      skipLocationChange: false,
    });
  }
}
