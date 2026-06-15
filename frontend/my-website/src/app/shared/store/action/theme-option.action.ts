export class ThemeOptionsAction {
  static readonly type = '[Theme IOption] Get';
}

export class UpdateSessionAction {
  static readonly type = '[Theme IOption] Update Session';
  constructor(
    public slug: string,
    public value: boolean,
  ) {}
}

export class UpdateProductBoxAction {
  static readonly type = '[Theme IOption] Update Product Box';
  constructor(public value: string) {}
}
