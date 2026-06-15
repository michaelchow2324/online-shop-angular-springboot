import { Component, inject, Input } from '@angular/core';
import { Params } from '@angular/router';

import { AttributeService } from '../../../../shared/services/attribute.service';
import { CollectionCategories } from '../widgets/collection-categories/collection-categories';
import { CollectionProducts } from '../widgets/collection-products/collection-products';

@Component({
  selector: 'app-collection-category-sidebar',
  imports: [CollectionCategories, CollectionProducts],
  templateUrl: './collection-category-sidebar.html',
  styleUrl: './collection-category-sidebar.scss',
})
export class CollectionCategorySidebar {
  attributeService = inject(AttributeService);

  @Input() filter: Params;
}
