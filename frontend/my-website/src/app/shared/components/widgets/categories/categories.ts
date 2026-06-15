import { SlicePipe } from '@angular/common';
import { Component, inject, Input, input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { categorySlider } from '../../../data/owl-carousel';
import { ICategory, ICategoryModel } from '../../../interface/category.interface';
import { AttributeService } from '../../../services/attribute.service';
import { CategoryState } from '../../../store/state/category.state';
import { Button } from '../button/button';
import { NoData } from '../no-data/no-data';

@Component({
  selector: 'app-categories',
  imports: [CarouselModule, TranslateModule, RouterModule, Button, NoData, SlicePipe],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private attributeService = inject(AttributeService);

  category$: Observable<ICategoryModel> = inject(Store).select(CategoryState.category);

  readonly categoryIds = input<number[]>([]);
  readonly style = input<string>('vertical');
  readonly image = input<string>();
  readonly slider = input<boolean>();
  @Input() options: OwlOptions = categorySlider;

  public categories: ICategory[];
  public selectedCategorySlug: string[] = [];
  public StorageURL = environment.storageURL;

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategorySlug = params['category'] ? params['category'].split(',') : [];
    });
    this.category$.subscribe(res => (this.categories = res.data.map(category => category)));
  }

  ngOnChanges() {
    const categoryIds = this.categoryIds();
    if (categoryIds && categoryIds.length) {
      this.category$.subscribe(
        res => (this.categories = this.getCategoriesByIds(res.data, this.categoryIds()!)),
      );
    }

    if (this.style() == 'vegetable') {
      this.options = {
        ...this.options,
        responsive: {
          ...this.options.responsive,
          768: {
            items: 4,
          },
          900: {
            items: 5,
          },
          1300: {
            items: 7,
          },
        },
      };
    }
  }

  redirectToCollection(slug: string) {
    let index = this.selectedCategorySlug.indexOf(slug);
    if (index === -1) this.selectedCategorySlug.push(slug);
    else this.selectedCategorySlug.splice(index, 1);

    void this.router.navigate(['/collections'], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategorySlug.length ? this.selectedCategorySlug?.join(',') : null,
      },
      queryParamsHandling: 'merge', // preserve the existing query params in the route
      skipLocationChange: false, // do trigger navigation
    });
  }

  getCategoriesByIds(categories: ICategory[], ids: number[]): ICategory[] {
    let matchedCategories: ICategory[] = [];

    categories.forEach(category => {
      if (ids.includes(category.id)) {
        matchedCategories.push(category);
      }

      if (category.subcategories?.length) {
        const matchedSubcategories = this.getCategoriesByIds(category.subcategories, ids);
        if (matchedSubcategories.length) {
          matchedCategories.push(...matchedSubcategories);
        }
      }
    });

    return matchedCategories;
  }

  closeCanvasMenu() {
    this.attributeService.offCanvasMenu = false;
  }
}
