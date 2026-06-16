import { Component, inject, Input } from '@angular/core';
import { Params } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IOption } from '../../../../shared/interface/theme-option.interface';
import { AttributeService } from '../../../../shared/services/attribute.service';
import { ThemeOptionState } from '../../../../shared/store/state/theme-option.state';
import { Banner } from '../widgets/banner/banner';
import { CollectionProducts } from '../widgets/collection-products/collection-products';
import { Sidebar } from '../widgets/sidebar/sidebar';

@Component({
  selector: 'app-collection-product-infinite-scroll',
  imports: [Banner, Sidebar, CollectionProducts],
  templateUrl: './collection-product-infinite-scroll.html',
  styleUrl: './collection-product-infinite-scroll.scss',
})
export class CollectionProductInfiniteScroll {
  attributeService = inject(AttributeService);

  themeOptions$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  @Input() filter: Params;

  public bannerImageUrl: string;

  constructor() {
    this.themeOptions$.subscribe(
      res => (this.bannerImageUrl = res?.collection?.collection_banner_image_url),
    );
  }
}
