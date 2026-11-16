import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, makeStateKey, TransferState } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ICategory, ICategoryModel } from '../interface/category.interface';
import { Params } from '../interface/core.interface';

// TransferState key — the server stores fetched categories here so the
// browser rehydrates from state instead of making a second HTTP call.
const CATEGORIES_KEY = makeStateKey<ICategory[]>('categories');

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  public searchSkeleton: boolean = false;
 
  getCategories(payload?: Params): Observable<ICategoryModel> {
    const locale = this.getLocale();

    // Browser must not reuse SSR/in-memory TransferState: that list stays
    // stale after admin create/disable until a full process restart.
    if (isPlatformBrowser(this.platformId)) {
      this.transferState.remove(CATEGORIES_KEY);
    } else {
      const transferred = this.transferState.get<ICategory[] | null>(CATEGORIES_KEY, null);
      if (transferred) {
        this.transferState.remove(CATEGORIES_KEY);
        const data = this.onlyActive(transferred);
        return of({ data, total: data.length } as ICategoryModel);
      }
    }

    return this.http
      .get<ICategory[]>(`${environment.apiUrl}/categories`, {
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        }),
        // `_ts` bypasses the old 1-hour GET /api/categories browser cache.
        params: { ...(payload ?? {}), locale, _ts: String(Date.now()) },
      })
      .pipe(
        tap((arr) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(CATEGORIES_KEY, arr ?? []);
          }
        }),
        map((arr) => {
          const data = this.onlyActive(arr || []);
          return { data, total: data.length } as ICategoryModel;
        }),
      );
  }

  getCategoryBySlug(slug: string): Observable<ICategory> {
    return this.http.get<ICategory>(`${environment.apiUrl}/categories/${slug}`, {
      params: { locale: this.getLocale() },
    });
  }

  private onlyActive(categories: ICategory[]): ICategory[] {
    return (categories || []).filter(category => category?.status !== false);
  }

  private getLocale(): string {
    try {
      const raw = localStorage.getItem('language');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.code || 'en';
    } catch {
      return 'en';
    }
  }
}
