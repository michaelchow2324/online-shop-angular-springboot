export class GetAllThemesAction {
  static readonly type = '[Themes] Get';
}

export class GetThemesAction {
  static readonly type = '[Themes] Get';
}

export class GetHomePageAction {
  static readonly type = '[Home Page] Get';
  constructor(public slug?: string) {}
}
