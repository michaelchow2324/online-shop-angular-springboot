import { Params } from '@angular/router';

export class GetMenuAction {
  static readonly type = '[Menu] Get';
  constructor(public payload?: Params) {}
}
