import { Component, inject, Input } from '@angular/core';

import { collectionCategorySlider } from '../../../../shared/data/owl-carousel';
import { Params } from '../../../../shared/interface/core.interface';
import { AttributeService } from '../../../../shared/services/attribute.service';
import { CollectionCategories } from '../widgets/collection-categories/collection-categories';
import { CollectionProducts } from '../widgets/collection-products/collection-products';
import { Sidebar } from '../widgets/sidebar/sidebar';

@Component({
  selector: 'app-collection-category-slider',
  imports: [Sidebar, CollectionProducts, CollectionCategories],
  templateUrl: './collection-category-slider.html',
  styleUrl: './collection-category-slider.scss',
})
export class CollectionCategorySlider {
  attributeService = inject(AttributeService);

  @Input() filter: Params;

  public categorySlider = collectionCategorySlider;
}
