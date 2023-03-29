import { isNil } from 'lodash-es';
import { ReactNode } from 'react';

import { HmisEnums } from '@/types/gqlEnums';
import {
  FormItem,
  ItemType,
  PickListOption,
  ValidationError,
} from '@/types/gqlTypes';
// BACKEND FORM PROCESSOR EXPECTS THE '_HIDDEN' STRING VALUE, DO NOT CHANGE
export const HIDDEN_VALUE = '_HIDDEN';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export enum ChangeType {
  User,
  System,
}

export type ItemChangedFn = (input: {
  linkId: string;
  value: any;
  type: ChangeType;
}) => void;

export type SeveralItemsChangedFn = (input: {
  values: FormValues;
  type: ChangeType;
}) => void;

// Props to DynamicField. Need to put here to avoid circular deps.
export interface DynamicFieldProps {
  item: FormItem;
  itemChanged: ItemChangedFn;
  nestingLevel: number;
  value: any;
  disabled?: boolean;
  errors?: ValidationError[];
  inputProps?: DynamicInputCommonProps;
  horizontal?: boolean;
  pickListRelationId?: string;
  noLabel?: boolean;
  warnIfEmpty?: boolean;
}

// Props accepted by all input components
export interface DynamicInputCommonProps {
  id?: string;
  disabled?: boolean;
  label?: ReactNode;
  error?: boolean;
  warnIfEmptyTreatment?: boolean;
  helperText?: ReactNode;
  min?: any;
  max?: any;
  placeholder?: string;
}

export type OverrideableDynamicFieldProps = Optional<
  Omit<DynamicFieldProps, 'item' | 'value' | 'nestingLevel'>,
  'itemChanged' // allow groups to override item changed
>;

// Props accepted by all group components
export interface GroupItemComponentProps {
  item: FormItem;
  nestingLevel: number;
  renderChildItem: (
    item: FormItem,
    props?: OverrideableDynamicFieldProps,
    renderFn?: (children: ReactNode) => ReactNode
  ) => ReactNode;
  values: Record<string, any>;
  itemChanged: ItemChangedFn;
  severalItemsChanged: SeveralItemsChangedFn;
  visible?: boolean;
  locked?: boolean;
}

export enum FormActionTypes {
  Save,
  Submit,
  Validate,
  Discard,
  Navigate,
}

export type FormValues = Record<string, any | null | undefined>;
export type ItemMap = Record<string, FormItem>;
export type LinkIdMap = Record<string, string[]>;
export type LocalConstants = Record<string, any>;

export const isHmisEnum = (k: string): k is keyof typeof HmisEnums => {
  return k in HmisEnums;
};

export const isQuestionItem = (item: FormItem): boolean =>
  ![ItemType.Display, ItemType.Group].includes(item.type);

export function isDate(value: any | null | undefined): value is Date {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof value.getMonth === 'function'
  );
}

export function isPickListOption(
  value: any | null | undefined
): value is PickListOption {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    !!value.code
  );
}

export function isPickListOptionArray(
  value: any | null | undefined
): value is PickListOption[] {
  return (
    !isNil(value) &&
    Array.isArray(value) &&
    value.length > 0 &&
    isPickListOption(value[0])
  );
}
