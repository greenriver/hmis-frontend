import { ReactNode } from 'react';

import { FormItem, ValidationError } from '@/types/gqlTypes';

// BACKEND FORM PROCESSOR EXPECTS THE '_HIDDEN' STRING VALUE, DO NOT CHANGE
export const HIDDEN_VALUE = '_HIDDEN';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// Props to DynamicField. Need to put here to avoid circular deps.
export interface DynamicFieldProps {
  item: FormItem;
  itemChanged: (linkId: string, value: any) => void;
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
  itemChanged: (linkId: string, value: any) => void;
  severalItemsChanged: (values: Record<string, any>) => void;
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
