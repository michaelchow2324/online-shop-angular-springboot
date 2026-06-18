import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IThemeOption } from '../interface/theme-option.interface';

@Injectable({
  providedIn: 'root',
})
export class ThemeOptionService {
  private http = inject(HttpClient);

  public preloader: boolean = true;
  public theme_color: string;
  public theme_color_2: string;
  public theme_color_class: string;
  public footer_height: number;
  public newsletterModal: boolean = false;
  public productBox: string;

  getThemeOption(): Observable<IThemeOption> {
    return this.http.get<IThemeOption>(`${environment.URL}/themeOptions.json`);
  }
}
