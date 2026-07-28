import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { Observable, Subject, of } from 'rxjs';

import { ICart, ICartModel } from '../interface/cart.interface';

const CART_STORAGE_KEY = 'cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private platformId = inject(PLATFORM_ID);

  private subjectQty = new Subject<boolean>();

  /** Load cart from localStorage (no demo cart.json). */
  getCartItems(): Observable<ICartModel> {
    return of(this.readLocalCart());
  }

  saveLocalCart(cart: Pick<ICartModel, 'items' | 'total' | 'is_digital_only'>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const payload: ICartModel = {
      items: cart.items ?? [],
      total: cart.total ?? 0,
      is_digital_only: cart.is_digital_only ?? false,
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  }

  clearLocalCart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  private readLocalCart(): ICartModel {
    const empty: ICartModel = { items: [], total: 0, is_digital_only: false };
    if (!isPlatformBrowser(this.platformId)) {
      return empty;
    }
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        return empty;
      }
      const parsed = JSON.parse(raw) as ICartModel;
      return {
        items: Array.isArray(parsed?.items) ? (parsed.items as ICart[]) : [],
        total: Number(parsed?.total) || 0,
        is_digital_only: !!parsed?.is_digital_only,
      };
    } catch {
      return empty;
    }
  }

  updateQty() {
    this.subjectQty.next(true);
  }

  getUpdateQtyClickEvent(): Observable<boolean> {
    return this.subjectQty.asObservable();
  }
}
