import { HttpClient } from '@angular/common/http';
import { Injectable, inject, makeStateKey, TransferState } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ICategory, ICategoryModel } from '../interface/category.interface';
import { Params } from '../interface/core.interface';

// TransferState key ??the server stores fetched categories here so the
// browser rehydrates from state instead of making a second HTTP call.
const CATEGORIES_KEY = makeStateKey<ICategory[]>('categories');

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  public searchSkeleton: boolean = false;
 
  getCategories(payload?: Params): Observable<ICategoryModel> {
    const locale = this.getLocale();
    // ?€?€?€ ORIGINAL CODE (kept for comparison) ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
    // return this.http
    //   .get<ICategory[]>(`${environment.apiUrl}/categories`, { params: payload })
    //   .pipe(
    //     map((arr) => {
    //       const data = (arr || []) as ICategory[];
    //       return { data, total: data.length } as ICategoryModel;
    //     })
    //   );
    // ?€?€?€ END ORIGINAL ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€

    // 1. During SSR (Server Side Rendering) the server serialises the API response into TransferState.
    // 2. In the browser, if the key exists (transferred from server), reuse it
    //    and remove it so subsequent navigations refetch from the API.
    const transferred = this.transferState.get<ICategory[] | null>(CATEGORIES_KEY, null);
    if (transferred) {
      this.transferState.remove(CATEGORIES_KEY);
      const data = transferred as ICategory[];
      return of({ data, total: data.length } as ICategoryModel);
    }

    return this.http
      .get<ICategory[]>(`${environment.apiUrl}/categories`, { params: { ...(payload ?? {}), locale } })
      .pipe(
        // Seed TransferState during SSR so the browser payload includes data.
        tap((arr) => this.transferState.set(CATEGORIES_KEY, arr ?? [])),
        map((arr) => {
          const data = (arr || []) as ICategory[];
          return { data, total: data.length } as ICategoryModel;
        }),
      );
  }

  getCategoryBySlug(slug: string): Observable<ICategory> {
    return this.http.get<ICategory>(`${environment.apiUrl}/categories/${slug}`, {
      params: { locale: this.getLocale() },
    });
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
