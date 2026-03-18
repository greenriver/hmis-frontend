import { PickListArgs } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import { PickListOption, PickListType } from '@/types/gqlTypes';

/** Base filter interface for all filter types. */
export interface BaseFilter<I> {
  key?: keyof I;
  label?: React.ReactNode;
  multi?: boolean;
  toInput?: (value: any) => I;
  fromInput?: (value: I) => any;
  isDynamic?: boolean;
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

export interface EnumFilter<I> extends BaseFilter<I> {
  type: 'enum';
  enumType: keyof typeof HmisEnums;
  pickListOptions?: PickListOption[]; // override picklist options
  variant?: SelectElementVariant;
}

export interface RemotePickListFilter<I> extends BaseFilter<I> {
  type: 'remote_picklist';
  pickListReference: PickListType; // name of remote pick list
  variant?: SelectElementVariant;
  pickListArgs?: PickListArgs;
}

export interface LocalPickListFilter<I> extends BaseFilter<I> {
  type: 'local_picklist';
  pickListOptions: PickListOption[];
  variant?: SelectElementVariant;
}

export type FilterType<I> =
  | TextFilter<I>
  | BooleanFilter<I>
  | EnumFilter<I>
  | RemotePickListFilter<I>
  | LocalPickListFilter<I>
  | DateFilter<I>;

// ?
export type TableFilterType<T> = Partial<Record<keyof T, FilterType<T>>>;
