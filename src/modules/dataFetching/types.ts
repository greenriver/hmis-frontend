export interface BaseFilter<I> {
  key?: keyof I;
  title?: React.ReactNode;
  toInput?: (value: any) => I;
  fromInput?: (value: I) => any;
}

export type SelectElementVariant = 'checkboxes' | 'select' | 'togglebuttons';

export interface TextFilter<I> extends BaseFilter<I> {
  type: 'text';
}

export interface BooleanFilter<I> extends BaseFilter<I> {
  type: 'boolean';
}

export interface SelectFilter<I> extends BaseFilter<I> {
  type: 'select';
  multi?: boolean;
  options: { value: any; display?: React.ReactNode }[];
  variant?: SelectElementVariant;
}

export interface EnumFilter<I> extends BaseFilter<I> {
  type: 'enum';
  multi?: boolean;
  enumType: Record<string, string>;
  variant?: SelectElementVariant;
}

export interface PickListFilter<I> extends BaseFilter<I> {
  type: 'picklist';
  multi?: boolean;
  pickListReference: string;
  variant?: SelectElementVariant;
}

export type FilterType<I> =
  | TextFilter<I>
  | BooleanFilter<I>
  | SelectFilter<I>
  | EnumFilter<I>
  | PickListFilter<I>;
