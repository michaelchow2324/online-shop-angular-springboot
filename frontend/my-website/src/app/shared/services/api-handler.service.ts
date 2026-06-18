import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiHandlerService {
  private http = inject(HttpClient);

  POST(payload: any): Observable<any> {
    return this.http.post(`${environment.URL}/login`, payload);
  }
}
