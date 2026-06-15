import { Params } from '../../interface/core.interface';
import { IContactUsModel } from '../../interface/page.interface';

export class GetPagesAction {
  static readonly type = '[Page] Get';
  constructor(public payload?: Params) {}
}

export class GetPageBySlugAction {
  static readonly type = '[Page] By Slug';
  constructor(public slug: string) {}
}

export class GetFaqsAction {
  static readonly type = '[Faq] Get';
}

export class ContactUsAction {
  static readonly type = '[ContactUs] Post';
  constructor(public payload: IContactUsModel) {}
}
