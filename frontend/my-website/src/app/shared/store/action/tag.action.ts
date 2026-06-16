import { Params } from '../../interface/core.interface';

export class GetTagsAction {
  static readonly type = '[Tag] Get';
  constructor(public payload?: Params) {}
}
