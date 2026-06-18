import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Params } from '../interface/core.interface';
import { IDownloadModel } from '../interface/download.interface';

@Injectable({
  providedIn: 'root',
})
export class DownloadsService {
  private http = inject(HttpClient);

  downloads(payload?: Params): Observable<IDownloadModel> {
    return this.http.get<IDownloadModel>(`${environment.URL}/download.json`, { params: payload });
  }
}
