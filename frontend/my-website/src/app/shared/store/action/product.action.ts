import { Params } from '../../interface/core.interface';

export class GetProductsAction {
  // name of the action
  static readonly type = '[Product] Get';

  // data that is passed with the action
  constructor(public payload?: Params) {}
}

export class GetRelatedProductsAction {
  static readonly type = '[Product] Related Get';
  constructor(public payload?: Params) {}
}

export class GetCategoryProductsAction {
  static readonly type = '[Product] Category Get';
  constructor(public payload?: Params) {}
}

export class GetStoreProductsAction {
  static readonly type = '[Product] Store Get';
  constructor(public payload?: Params) {}
}

export class GetProductBySlugAction {
  static readonly type = '[Product] Get By Slug';
  constructor(public slug: string) {}
}

export class GetDealProductsAction {
  static readonly type = '[Product] Deal Get';
  constructor(public payload?: Params) {}
}

export class GetMenuProductsAction {
  static readonly type = '[Product] Menu Get';
  constructor(public payload?: Params) {}
}

export class GetProductBySearchAction {
  static readonly type = '[ProductBySearch] Get';
  constructor(public payload?: Params) {}
}

export class GetProductBySearchListAction {
  static readonly type = '[ProductBySearchList] Get';
  constructor(public payload?: Params) {}
}

export class GetProductByIdsAction {
  static readonly type = '[ProductByIds] Get';
  constructor(public payload?: Params) {}
}

export class GetNewArrivalsAction {
  static readonly type = '[Product] New Arrivals Get';
  constructor(public limit: number = 10) {}
}

export class GetMoreProductAction {
  static readonly type = '[MoreProduct] Get';
  constructor(
    public payload?: Params,
    public value?: boolean,
  ) {}
}
