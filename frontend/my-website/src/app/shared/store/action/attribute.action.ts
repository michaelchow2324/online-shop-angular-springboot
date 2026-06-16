import { Params } from '../../interface/core.interface';

export class GetAttributesAction {
  static readonly type = '[Attribute] Get';
  constructor(public payload?: Params) {}
}

export class GetAttributeValuesAction {
  static readonly type = '[Attribute] Value Get';
  constructor(public payload?: Params) {}
}

export class GetAttributeAction {
  static readonly type = '[Attribute] Edit';
  constructor(public id: number) {}
}
