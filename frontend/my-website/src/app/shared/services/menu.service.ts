import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Params } from '../interface/core.interface';
import { IMenuModel } from '../interface/menu.interface';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;
  public mainMenuToggle: boolean = false;
  public sideNavToggle: boolean = false;
  public isOpenSearch: boolean = false;

  getMenu(payload?: Params): Observable<IMenuModel> {
    return this.http.get<IMenuModel>(`${environment.URL}/menu.json`, { params: payload });
  }
}
