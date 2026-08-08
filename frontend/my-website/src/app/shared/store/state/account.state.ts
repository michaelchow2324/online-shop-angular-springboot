import { Injectable, inject } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

import { IAccountUser } from '../../interface/account.interface';
import { CustomerAddress } from '../../interface/customer-address.interface';
import { AccountService } from '../../services/account.service';
import { NotificationService } from '../../services/notification.service';
import {
  AccountClearAction,
  CreateAddressAction,
  DeleteAddressAction,
  GetAddressesAction,
  GetUserDetailsAction,
  SetDefaultAddressAction,
  UpdateAddressAction,
  UpdateUserPasswordAction,
  UpdateUserProfileAction,
} from '../action/account.action';

export class AccountStateModel {
  user: IAccountUser | null;
  addresses: CustomerAddress[];
  permissions: [];
}

@State<AccountStateModel>({
  name: 'account',
  defaults: {
    user: null,
    addresses: [],
    permissions: [],
  },
})
@Injectable()
export class AccountState {
  private accountService = inject(AccountService);
  private notificationService = inject(NotificationService);

  @Selector()
  static user(state: AccountStateModel) {
    return state.user;
  }

  @Selector()
  static addresses(state: AccountStateModel) {
    return state.addresses;
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
  updateProfile(ctx: StateContext<AccountStateModel>, { payload }: UpdateUserProfileAction) {
    return this.accountService.updateProfile(payload.displayName).pipe(
      tap({
        next: user => {
          ctx.patchState({ user });
          this.notificationService.showSuccess('Profile updated');
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to update profile');
        },
      }),
    );
  }

  @Action(UpdateUserPasswordAction)
  updatePassword(
    _ctx: StateContext<AccountStateModel>,
    { payload }: UpdateUserPasswordAction,
  ) {
    return this.accountService
      .changePassword(payload.current_password, payload.new_password)
      .pipe(
        tap({
          next: () => {
            this.notificationService.showSuccess('Password updated');
          },
          error: err => {
            throw new Error(err?.error?.message || 'Failed to change password');
          },
        }),
      );
  }

  @Action(GetAddressesAction)
  getAddresses(ctx: StateContext<AccountStateModel>) {
    return this.accountService.getAddresses().pipe(
      tap({
        next: addresses => {
          ctx.patchState({ addresses: addresses ?? [] });
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to load addresses');
        },
      }),
    );
  }

  @Action(CreateAddressAction)
  createAddress(ctx: StateContext<AccountStateModel>, { payload }: CreateAddressAction) {
    return this.accountService.createAddress(payload).pipe(
      tap({
        next: created => {
          const existing = ctx.getState().addresses;
          const addresses = created.isDefault
            ? [...existing.map(a => ({ ...a, isDefault: false })), created]
            : [...existing, created];
          ctx.patchState({ addresses });
          this.notificationService.showSuccess('Address saved');
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to save address');
        },
      }),
    );
  }

  @Action(UpdateAddressAction)
  updateAddress(ctx: StateContext<AccountStateModel>, { payload, id }: UpdateAddressAction) {
    return this.accountService.updateAddress(id, payload).pipe(
      tap({
        next: updated => {
          const addresses = ctx.getState().addresses.map(a => (a.id === id ? updated : a));
          // If this became default, clear others in local state
          const normalized = updated.isDefault
            ? addresses.map(a => (a.id === id ? a : { ...a, isDefault: false }))
            : addresses;
          ctx.patchState({ addresses: normalized });
          this.notificationService.showSuccess('Address updated');
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to update address');
        },
      }),
    );
  }

  @Action(DeleteAddressAction)
  deleteAddress(ctx: StateContext<AccountStateModel>, { id }: DeleteAddressAction) {
    return this.accountService.deleteAddress(id).pipe(
      tap({
        next: () => {
          ctx.patchState({
            addresses: ctx.getState().addresses.filter(a => a.id !== id),
          });
          this.notificationService.showSuccess('Address removed');
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to delete address');
        },
      }),
    );
  }

  @Action(SetDefaultAddressAction)
  setDefaultAddress(ctx: StateContext<AccountStateModel>, { id }: SetDefaultAddressAction) {
    return this.accountService.setDefaultAddress(id).pipe(
      tap({
        next: updated => {
          const addresses = ctx.getState().addresses.map(a =>
            a.id === id ? updated : { ...a, isDefault: false },
          );
          ctx.patchState({ addresses });
          this.notificationService.showSuccess('Default address updated');
        },
        error: err => {
          throw new Error(err?.error?.message || 'Failed to set default address');
        },
      }),
    );
  }

  @Action(AccountClearAction)
  accountClear(ctx: StateContext<AccountStateModel>) {
    ctx.patchState({
      user: null,
      addresses: [],
      permissions: [],
    });
  }
}
