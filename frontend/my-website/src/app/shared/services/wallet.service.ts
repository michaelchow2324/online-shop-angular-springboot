import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IWallet } from '../interface/wallet.interface';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private http = inject(HttpClient);

  getUserTransaction(payload?: Params): Observable<IWallet> {
    return this.http.get<IWallet>(`${environment.URL}/wallet.json`, { params: payload });
  }
}
