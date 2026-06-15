import { Component, inject, Input } from '@angular/core';
import { Params } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { IOption } from '../../../../shared/interface/theme-option.interface';
import { AttributeService } from '../../../../shared/services/attribute.service';
import { ThemeOptionState } from '../../../../shared/store/state/theme-option.state';
import { Banner } from '../widgets/banner/banner';
import { CollectionProducts } from '../widgets/collection-products/collection-products';

@Component({
  selector: 'app-collection-sidebar-popup',
  imports: [Banner, CollectionProducts],
  templateUrl: './collection-sidebar-popup.html',
  styleUrl: './collection-sidebar-popup.scss',
})
export class CollectionSidebarPopup {
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
