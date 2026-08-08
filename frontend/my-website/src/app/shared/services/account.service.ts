import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IAccountUser } from '../interface/account.interface';
import { MeDTO } from '../interface/auth.interface';
import {
  CustomerAddress,
  UpsertAddressRequest,
} from '../interface/customer-address.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);

  public isOpenMenu: boolean = false;

  /** Maps Spring MeDTO into the Multikart account user shape used by the sidebar. */
  getUserDetails(): Observable<IAccountUser> {
    return this.http.get<MeDTO>(`${environment.apiUrl}/me`).pipe(
      map((me: MeDTO) => this.toAccountUser(me)),
    );
  }

  updateProfile(displayName: string): Observable<IAccountUser> {
    return this.http
      .patch<MeDTO>(`${environment.apiUrl}/me`, { displayName })
      .pipe(map(me => this.toAccountUser(me)));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/me/password`, {
      currentPassword,
      newPassword,
    });
  }

  getAddresses(): Observable<CustomerAddress[]> {
    return this.http.get<CustomerAddress[]>(`${environment.apiUrl}/me/addresses`);
  }

  createAddress(body: UpsertAddressRequest): Observable<CustomerAddress> {
    return this.http.post<CustomerAddress>(`${environment.apiUrl}/me/addresses`, body);
  }

  updateAddress(id: number, body: UpsertAddressRequest): Observable<CustomerAddress> {
    return this.http.put<CustomerAddress>(`${environment.apiUrl}/me/addresses/${id}`, body);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/me/addresses/${id}`);
  }

  setDefaultAddress(id: number): Observable<CustomerAddress> {
    return this.http.post<CustomerAddress>(
      `${environment.apiUrl}/me/addresses/${id}/default`,
      {},
    );
  }

  private toAccountUser(me: MeDTO): IAccountUser {
    const display =
      me.displayName?.trim() || me.email.split('@')[0] || me.email;
    return {
      id: me.id,
      name: display,
      email: me.email,
      phone: '',
      country_code: '1',
      status: true,
      email_verified_at: me.emailVerifiedAt ?? '',
      payment_account: null as unknown as IAccountUser['payment_account'],
      role_id: 0,
      role_name: me.role,
      orders_count: 0,
      is_approved: true,
      permission: [],
    } as IAccountUser & { permission: [] };
  }
}
