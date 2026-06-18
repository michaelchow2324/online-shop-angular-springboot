import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IWishlistModel } from '../interface/wishlist.interface';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);

  public skeletonLoader: boolean = false;

  getWishlistItems(): Observable<IWishlistModel> {
    return this.http.get<IWishlistModel>(`${environment.URL}/wishlist.json`);
  }
}
