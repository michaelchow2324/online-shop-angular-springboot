import { Injectable, inject } from '@angular/core';

import { map, Observable } from 'rxjs';

import { IAccountUser } from '../interface/account.interface';
import { MeDTO } from '../interface/auth.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private authService = inject(AuthService);

  public isOpenMenu: boolean = false;

  /** Maps Spring MeDTO into the Multikart account user shape used by the sidebar. */
  getUserDetails(): Observable<IAccountUser> {
    return this.authService.me().pipe(
      map(
        (me: MeDTO) =>
          ({
            id: me.id,
            name: me.email.split('@')[0],
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
          }) as IAccountUser & { permission: [] },
      ),
    );
  }
}
