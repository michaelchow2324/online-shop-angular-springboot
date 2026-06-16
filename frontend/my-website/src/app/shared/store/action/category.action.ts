import { Params } from '../../interface/core.interface';

export class GetCategoriesAction {
  static readonly type = '[Category] Get';
  constructor(public payload?: Params) {}
}

export class GetCategoryAction {
  static readonly type = '[Category] Get';
  constructor(public payload?: Params) {}
}

export class GetFooterCategoriesAction {
  static readonly type = '[FooterCategory] Get';
  constructor(public payload?: Params) {}
}

export class GetHeaderCategoriesAction {
  static readonly type = '[HeaderCategory] Get';
  constructor(public payload?: Params) {}
}

export class GetProductCategoryAction {
  static readonly type = '[ProductCategory] Get';
  constructor(public payload?: Params) {}
}

export class GetSearchByCategoryAction {
  static readonly type = '[CategoryBySearch] Get';
  constructor(public payload?: Params) {}
}

export class GetCategoryBySlugAction {
  static readonly type = '[Category] Get Category By Slug';
  constructor(public slug: string) {}
}
