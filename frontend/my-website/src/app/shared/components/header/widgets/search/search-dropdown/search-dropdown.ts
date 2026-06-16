import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, inject, input, Input, viewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { ICategory } from '../../../../../interface/category.interface';
import { IProduct } from '../../../../../interface/product.interface';
import { HighlighterPipe } from '../../../../../pipe/highlighter.pipe';
import { CategoryService } from '../../../../../services/category.service';
import { MenuService } from '../../../../../services/menu.service';
import { ProductService } from '../../../../../services/product.service';
import { ProductState } from '../../../../../store/state/product.state';

@Component({
  selector: 'app-search-dropdown',
  imports: [TranslateModule, RouterModule, HighlighterPipe, NgTemplateOutlet],
  templateUrl: './search-dropdown.html',
  styleUrl: './search-dropdown.scss',
})
export class SearchDropdown {
  categoryService = inject(CategoryService);
  productService = inject(ProductService);
  router = inject(Router);
  menuService = inject(MenuService);

  @Input() term: string;

  readonly isOpenResult = input<boolean>();
  readonly selectedResultIndex = input<number>();
  readonly categories = input<ICategory[]>();
  readonly products = input<IProduct[]>();
  readonly selectedCategory = input<String>();

  readonly resultsContainer = viewChild<ElementRef>('resultsContainer');

  productBySearch$: Observable<IProduct[]> = inject(Store).select(ProductState.productBySearch);

  public skeleton = Array.from({ length: 3 }, (_, index) => index);

  reDirectCategory(slug: string) {
    void this.router.navigate(['/collections'], {
      queryParams: {
        category: slug ? slug : null,
      },
      skipLocationChange: false, // do trigger navigation
    });
    this.term = '';
    this.menuService.isOpenSearch = false;
  }
}
