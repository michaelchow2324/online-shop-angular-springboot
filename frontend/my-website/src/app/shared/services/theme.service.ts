import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IThemesModel } from '../interface/theme.interface';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private http = inject(HttpClient);

  getThemes(): Observable<IThemesModel> {
    return this.http.get<IThemesModel>(`${environment.URL}/theme.json`);
  }

  getHomePage(slug?: string): Observable<any> {
    return this.http.get(`${environment.URL}/home/${slug}.json`);
  }
}
