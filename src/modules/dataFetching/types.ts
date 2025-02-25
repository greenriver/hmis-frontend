import { PickListArgs } from '../form/types';

import { ColumnDef } from '@/components/elements/table/types';
import { HmisEnums } from '@/types/gqlEnums';
import { PickListOption, PickListType } from '@/types/gqlTypes';

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
  enumType: keyof typeof HmisEnums;
  pickListOptions?: PickListOption[]; // override picklist options
  variant?: SelectElementVariant;
}

export interface PickListFilter<I> extends BaseFilter<I> {
  type: 'picklist';
  pickListReference: PickListType; // name of remote pick list
  variant?: SelectElementVariant;
  pickListArgs?: PickListArgs;
}

export type FilterType<I> =
  | TextFilter<I>
  | BooleanFilter<I>
  | SelectFilter<I>
  | EnumFilter<I>
  | PickListFilter<I>
  | DateFilter<I>;

export type GenericTableWithDataColumnDef<RowType, QueryVariables> = {
  // configuration for making this column Optional
  optional?: {
    defaultHidden: boolean;
    queryVariableField?: keyof QueryVariables; // field to set on QueryVariables if col is included. Not required; some tables need to query optional column data even when the optional col is hidden, such as Enrollment Exit Date
    queryVariableValue?: any; // value to set on QueryVariables if col is included (default: true)
  };
} & ColumnDef<RowType>;
