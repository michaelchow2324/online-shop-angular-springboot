import { Injectable } from '@angular/core';

import { Action, StateContext } from '@ngxs/store';

import { SubscriptionAction } from '../action/subscription.action';

@Injectable()
export class SubscriptionState {
  constructor() {}

  @Action(SubscriptionAction)
  create(_ctx: StateContext<string>, _action: SubscriptionAction) {
    // subscription Logic Here
  }
}
