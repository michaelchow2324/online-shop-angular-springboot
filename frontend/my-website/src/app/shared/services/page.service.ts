import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Params } from '../interface/core.interface';
import { IFaqModel, IPageModel } from '../interface/page.interface';
import { IStoresModel } from '../interface/store.interface';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;

  getPages(payload?: Params): Observable<IPageModel> {
    return this.http.get<IPageModel>(`${environment.URL}/page.json`, { params: payload });
  }

  getFaqs(): Observable<IFaqModel> {
    return this.http.get<IFaqModel>(`${environment.URL}/faq.json`);
  }

  getStores(payload?: Params): Observable<IStoresModel> {
    return this.http.get<IStoresModel>(`${environment.URL}/store`, { params: payload });
  }
}
