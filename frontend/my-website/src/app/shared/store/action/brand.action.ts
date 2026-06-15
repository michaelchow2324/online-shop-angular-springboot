import { Params } from '../../interface/core.interface';

export class GetBrandsAction {
  static readonly type = '[Brand] Get';
  constructor(public payload?: Params) {}
}

export class GetBrandBySlugAction {
  static readonly type = '[Brand] Get Brand By Slug';
  constructor(public slug: string) {}
}
