import { Params } from '../../interface/core.interface';

export class GetCurrenciesAction {
  static readonly type = '[Currency] Get';
  constructor(public payload?: Params) {}
}
