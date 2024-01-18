import React, { RefObject } from 'react';

import { FormValues, LocalConstants, PickListArgs } from '../types';

import { FormActionProps } from './FormActions';
import RefactorForm from './refactor/RefactorForm';

import { ValidationDialogProps } from '@/modules/errors/components/ValidationDialog';
import { ErrorState } from '@/modules/errors/util';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface DynamicFormSubmitInput {
  values: FormValues;
  confirmed?: boolean;
  event?: React.MouseEvent<HTMLButtonElement>;
  onSuccess?: VoidFunction;
  onError?: VoidFunction;
}

export type DynamicFormOnSubmit = (input: DynamicFormSubmitInput) => void;

export interface DynamicFormProps
  extends Omit<
    FormActionProps,
    'disabled' | 'loading' | 'onSubmit' | 'onSaveDraft'
  > {
  clientId?: string;
  definition: FormDefinitionJson;
  onSubmit: DynamicFormOnSubmit;
  onSaveDraft?: (values: FormValues, onSuccess?: VoidFunction) => void;
  onDirty?: (value: boolean) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors: ErrorState;
  showSavePrompt?: boolean;
  alwaysShowSaveSlide?: boolean;
  horizontal?: boolean;
  pickListArgs?: PickListArgs;
  warnIfEmpty?: boolean;
  locked?: boolean;
  visible?: boolean;
  FormActionProps?: Omit<
    FormActionProps,
    'loading' | 'onSubmit' | 'onSaveDraft'
  >;
  ValidationDialogProps?: Omit<
    ValidationDialogProps,
    'errorState' | 'open' | 'onConfirm' | 'loading'
  >;
  hideSubmit?: boolean;
  localConstants?: LocalConstants;
  errorRef?: RefObject<HTMLDivElement>;
}
export interface DynamicFormRef {
  SaveIfDirty: VoidFunction;
  SubmitIfDirty: (ignoreWarnings: boolean) => void;
  SubmitForm: VoidFunction;
}

export default RefactorForm;
