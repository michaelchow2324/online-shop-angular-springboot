import { IAccountUserUpdatePassword } from '../../interface/account.interface';
import { UpsertAddressRequest } from '../../interface/customer-address.interface';

export class GetUserDetailsAction {
  static readonly type = '[Account] User Get';
  constructor() {}
}

export class UpdateUserProfileAction {
  static readonly type = '[Account] User Update';
  constructor(public payload: { displayName: string }) {}
}

export class UpdateUserPasswordAction {
  static readonly type = '[Account] User Update Password';
  constructor(public payload: IAccountUserUpdatePassword) {}
}

export class GetAddressesAction {
  static readonly type = '[Account] Address List';
  constructor() {}
}

export class CreateAddressAction {
  static readonly type = '[Account] Address Create';
  constructor(public payload: UpsertAddressRequest) {}
}

export class UpdateAddressAction {
  static readonly type = '[Account] Address Edit';
  constructor(
    public payload: UpsertAddressRequest,
    public id: number,
  ) {}
}

export class DeleteAddressAction {
  static readonly type = '[Account] Address Delete';
  constructor(public id: number) {}
}

export class SetDefaultAddressAction {
  static readonly type = '[Account] Address Set Default';
  constructor(public id: number) {}
}

export class AccountClearAction {
  static readonly type = '[Account] Clear';
  constructor() {}
}
