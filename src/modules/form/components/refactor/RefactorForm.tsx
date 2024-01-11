import { Grid, Stack } from '@mui/material';
import React, {
  BaseSyntheticEvent,
  RefObject,
  forwardRef,
  useCallback,
} from 'react';

import { DynamicFormContext } from '../../hooks/useDynamicFormContext';
import { FormValues, LocalConstants, PickListArgs } from '../../types';

import { FormActionProps } from '../FormActions';

import RefactorFormFields from './RefactorFormFields';
import DynamicFormSaveButtons from './RefactorFormSaveButtons';
import useFormDefinitionHandlers from './useFormDefinitionHandlers';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ValidationDialogProps } from '@/modules/errors/components/ValidationDialog';
import { ErrorState, hasErrors } from '@/modules/errors/util';
import { formAutoCompleteOff } from '@/modules/form/util/formUtil';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface DynamicFormSubmitInput {
  values: FormValues;
  confirmed?: boolean;
  event?: BaseSyntheticEvent;
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

const DynamicForm = forwardRef(
  ({
    definition,
    onSubmit,
    onSaveDraft,
    loading,
    initialValues,
    errors: errorState,
    showSavePrompt = false,
    alwaysShowSaveSlide = false,
    locked = false,
    pickListArgs,
    FormActionProps = {},
    ValidationDialogProps = {},
    hideSubmit = false,
    localConstants,
    errorRef,
    ...props
  }: DynamicFormProps) => {
    const handlers = useFormDefinitionHandlers({
      definition,
      initialValues,
      localConstants,
      onSubmit: (...args) => console.log({ args }),
    });

    const { getCleanedValues } = handlers;

    const handleSaveDraft = useCallback(() => {
      if (!onSaveDraft) return;
      onSaveDraft(getCleanedValues());
    }, [onSaveDraft, getCleanedValues]);

    return (
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        autoComplete={formAutoCompleteOff}
      >
        <Grid container direction='column' spacing={2}>
          <div ref={errorRef} />
          {hasErrors(errorState) && (
            <Grid item>
              <Stack gap={2}>
                <ApolloErrorAlert error={errorState.apolloError} />
                <ErrorAlert errors={errorState.errors} fixable />
              </Stack>
            </Grid>
          )}
          <DynamicFormContext.Provider value={{ getCleanedValues, definition }}>
            <RefactorFormFields handlers={handlers} {...props} />
          </DynamicFormContext.Provider>
        </Grid>
        <DynamicFormSaveButtons
          handlers={handlers}
          onSubmit={(e) => console.log(e)}
          onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
          disabled={locked || !!loading}
          loading={loading}
          errors={errorState}
          showSavePrompt={showSavePrompt}
          alwaysShowSaveSlide={alwaysShowSaveSlide}
          hideSubmit={hideSubmit}
          ValidationDialogProps={ValidationDialogProps}
          {...FormActionProps}
        />
      </form>
    );
  }
);

export default DynamicForm;
