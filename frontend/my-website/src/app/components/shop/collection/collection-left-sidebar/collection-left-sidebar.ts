import { Component, inject, Input } from '@angular/core';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Params } from '../../../../shared/interface/core.interface';
import { IOption } from '../../../../shared/interface/theme-option.interface';
import { AttributeService } from '../../../../shared/services/attribute.service';
import { ThemeOptionState } from '../../../../shared/store/state/theme-option.state';
import { Banner } from '../widgets/banner/banner';
import { CollectionProducts } from '../widgets/collection-products/collection-products';
import { Sidebar } from '../widgets/sidebar/sidebar';

@Component({
  selector: 'app-collection-left-sidebar',
  imports: [Banner, Sidebar, CollectionProducts],
  templateUrl: './collection-left-sidebar.html',
  styleUrl: './collection-left-sidebar.scss',
})
export class CollectionLeftSidebar {
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
