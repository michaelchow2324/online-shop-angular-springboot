import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, input } from '@angular/core';
import { Params } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IAttributeModel } from '../../../../../shared/interface/attribute.interface';
import { AttributeService } from '../../../../../shared/services/attribute.service';
import { GetAttributesAction } from '../../../../../shared/store/action/attribute.action';
import { AttributeState } from '../../../../../shared/store/state/attribute.state';
import { CollectionAttributeFilter } from '../filter/collection-attribute-filter/collection-attribute-filter';
import { CollectionBrandFilter } from '../filter/collection-brand-filter/collection-brand-filter';
import { CollectionCategoryFilter } from '../filter/collection-category-filter/collection-category-filter';
import { CollectionFilter } from '../filter/collection-filter/collection-filter';
import { CollectionPriceFilter } from '../filter/collection-price-filter/collection-price-filter';
import { CollectionRatingFilter } from '../filter/collection-rating-filter/collection-rating-filter';
import { SkeletonCollectionSidebar } from '../skeleton-collection-sidebar/skeleton-collection-sidebar';

@Component({
  selector: 'app-collection-sidebar',
  imports: [
    NgbModule,
    TranslateModule,
    CollectionCategoryFilter,
    CollectionAttributeFilter,
    CollectionPriceFilter,
    CollectionRatingFilter,
    CollectionBrandFilter,
    CollectionFilter,
    SkeletonCollectionSidebar,
    AsyncPipe,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private store = inject(Store);
  attributeService = inject(AttributeService);

  @Input() filter: Params;

  readonly sidebarPopup = input<boolean>();
  readonly hideFilter = input<string[]>([]);

  attribute$: Observable<IAttributeModel> = inject(Store).select(AttributeState.attribute);

  constructor() {
    this.store.dispatch(new GetAttributesAction({ status: 1 }));
  }

  closeCanvasMenu() {
    this.attributeService.offCanvasMenu = false;
  }
}
