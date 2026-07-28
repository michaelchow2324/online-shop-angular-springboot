import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

/**
 * Cart data lives in NGXS `CartState` and is persisted by NgxsStoragePlugin
 * (see app.config.ts keys: ['cart', ...]).
 *
 * This service only handles UI helpers (qty click stream) — not storage.
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private subjectQty = new Subject<boolean>();

  updateQty() {
    this.subjectQty.next(true);
  }

  getUpdateQtyClickEvent(): Observable<boolean> {
    return this.subjectQty.asObservable();
  }
}
