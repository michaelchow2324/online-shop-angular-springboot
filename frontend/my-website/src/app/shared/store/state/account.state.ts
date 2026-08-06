import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { tap } from 'rxjs';

import { IAccountUser, IAccountUserUpdatePassword } from '../../interface/account.interface';
import { AccountService } from '../../services/account.service';
import { NotificationService } from '../../services/notification.service';
import {
  AccountClearAction,
  CreateAddressAction,
  DeleteAddressAction,
  GetUserDetailsAction,
  UpdateAddressAction,
  UpdateUserPasswordAction,
  UpdateUserProfileAction,
} from '../action/account.action';

export class AccountStateModel {
  user: IAccountUser | null;
  permissions: [];
}

@State<AccountStateModel>({
  name: 'account',
  defaults: {
    user: null,
    permissions: [],
  },
})
@Injectable()
export class AccountState {
  private store = inject(Store);
  private accountService = inject(AccountService);
  private notificationService = inject(NotificationService);

  @Selector()
  static user(state: AccountStateModel) {
    return state.user;
  }

  @Selector()
  static permissions(state: AccountStateModel) {
    return state.permissions;
  }

  @Action(GetUserDetailsAction)
  getUserDetails(ctx: StateContext<AccountStateModel>) {
    return this.accountService.getUserDetails().pipe(
      tap({
        next: result => {
          ctx.patchState({
            user: result,
            permissions: (result as { permission?: [] }).permission ?? [],
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        },
      }),
    );
  }

  @Action(UpdateUserProfileAction)
  updateProfile(
    _ctx: StateContext<AccountStateModel>,
    { payload: _payload }: UpdateUserProfileAction,
  ) {
    // Update Profile Logic Here
  }

  @Action(UpdateUserPasswordAction)
  updatePassword(
    _ctx: StateContext<IAccountUserUpdatePassword>,
    { payload: _payload }: UpdateUserPasswordAction,
  ) {
    // Update Password Logic Here
  }

  @Action(CreateAddressAction)
  createAddress(_ctx: StateContext<AccountStateModel>, _action: CreateAddressAction) {
    // Create Address Logic Here
  }

  @Action(UpdateAddressAction)
  updateAddress(_ctx: StateContext<AccountStateModel>, _action: UpdateAddressAction) {
    // Update Address Logic Here
  }

  @Action(DeleteAddressAction)
  deleteAddress(_ctx: StateContext<AccountStateModel>, _action: DeleteAddressAction) {
    // Delete Address Logic Here
  }

  @Action(AccountClearAction)
  accountClear(ctx: StateContext<AccountStateModel>) {
    ctx.patchState({
      user: null,
      permissions: [],
    });
  }
}
