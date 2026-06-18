import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  IAttribute,
  IAttributeModel,
  IAttributeValueModel,
} from '../interface/attribute.interface';

@Injectable({
  providedIn: 'root',
})
export class AttributeService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;
  public offCanvasMenu: boolean = false;

  getAttributes(payload?: Params): Observable<IAttributeModel> {
    return this.http.get<IAttributeModel>(`${environment.URL}/attribute.json`, { params: payload });
  }

  getAttributeValues(payload?: Params): Observable<IAttributeValueModel> {
    return this.http.get<IAttributeValueModel>(`${environment.URL}/attribute-value.json`, {
      params: payload,
    });
  }

  getAttribute(id: number): Observable<IAttribute> {
    return this.http.get<IAttribute>(`${environment.URL}/attribute/${id}`);
  }
}
