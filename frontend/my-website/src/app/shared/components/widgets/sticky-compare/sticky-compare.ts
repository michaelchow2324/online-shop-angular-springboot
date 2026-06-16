import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { GetCompareAction } from '../../../store/action/compare.action';
import { CompareState } from '../../../store/state/compare.state';

@Component({
  selector: 'app-sticky-compare',
  imports: [RouterModule, TranslateModule, AsyncPipe],
  templateUrl: './sticky-compare.html',
  styleUrl: './sticky-compare.scss',
})
export class StickyCompare {
  private store = inject(Store);

  compareTotal$: Observable<number> = inject(Store).select(CompareState.compareTotal);

  constructor() {
    this.store.dispatch(new GetCompareAction());
  }
}
