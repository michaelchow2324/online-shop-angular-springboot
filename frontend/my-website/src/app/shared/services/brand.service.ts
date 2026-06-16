import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { IBrand, IBrandModel } from '../interface/brand.interface';
import { Params } from '../interface/core.interface';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;

  getBrands(payload?: Params): Observable<IBrandModel> {
    return this.http.get<IBrandModel>(`${environment.URL}/brand.json`, { params: payload });
  }

  getBrandBySlug(slug: string): Observable<IBrand> {
    return this.http.get<IBrand>(`${environment.URL}/brand/slug/${slug}`);
  }
}
