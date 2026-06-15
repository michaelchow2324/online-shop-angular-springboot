export class SubscriptionAction {
  static readonly type = '[Subscription] Post';
  constructor(public payload: { email: string }) {}
}
