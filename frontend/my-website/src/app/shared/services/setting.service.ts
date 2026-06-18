import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ISetting } from '../interface/setting.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private http = inject(HttpClient);

  getSettingOption(): Observable<ISetting> {
    return this.http.get<ISetting>(`${environment.URL}/settings.json`);
  }
}
