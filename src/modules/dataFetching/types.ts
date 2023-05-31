import { PickListType } from '@/types/gqlTypes';

export interface BaseFilter<I> {
  key?: keyof I;
  label?: React.ReactNode;
  multi?: boolean;
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

export interface DateFilter<I> extends BaseFilter<I> {
  type: 'date';
}

export interface SelectFilter<I> extends BaseFilter<I> {
  type: 'select';
  options: { value: any; display?: React.ReactNode }[];
  variant?: SelectElementVariant;
}

export interface EnumFilter<I> extends BaseFilter<I> {
  type: 'enum';
  enumType: Record<string, string>;
  variant?: SelectElementVariant;
}

export interface PickListFilter<I> extends BaseFilter<I> {
  type: 'picklist';
  pickListReference: PickListType;
  variant?: SelectElementVariant;
  relationId?: string;
}

export type FilterType<I> =
  | TextFilter<I>
  | BooleanFilter<I>
  | SelectFilter<I>
  | EnumFilter<I>
  | PickListFilter<I>
  | DateFilter<I>;
