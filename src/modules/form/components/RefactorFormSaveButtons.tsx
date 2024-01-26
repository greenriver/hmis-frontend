import { Box } from '@mui/material';
import React, { useCallback } from 'react';
import { useFormState } from 'react-hook-form';

import { FormValues } from '../types';

import { DynamicFormOnSubmit } from './DynamicForm';
import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';

import { FormDefinitionHandlers } from './useFormDefinitionHandlers';
import useElementInView from '@/hooks/useElementInView';
import { ValidationDialogProps } from '@/modules/errors/components/ValidationDialog';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import { ErrorState } from '@/modules/errors/util';

export interface DynamicFormSaveButtonsProps
  extends Omit<FormActionProps, 'loading' | 'onSubmit' | 'onSaveDraft'> {
  handlers: FormDefinitionHandlers;
  onSubmit: DynamicFormOnSubmit;
  onSaveDraft?: (values: FormValues, onSuccess?: VoidFunction) => void;
  loading?: boolean;
  errors: ErrorState;
  showSavePrompt?: boolean;
  alwaysShowSaveSlide?: boolean;
  locked?: boolean;
  visible?: boolean;
  ValidationDialogProps?: Omit<
    ValidationDialogProps,
    'errorState' | 'open' | 'onConfirm' | 'loading'
  >;
  hideSubmit?: boolean;
  FormActionProps?: Omit<
    FormActionProps,
    'loading' | 'onSubmit' | 'onSaveDraft'
  >;
}

const DynamicFormSaveButtons = ({
  handlers,
  onSubmit,
  onSaveDraft,
  loading,
  errors: errorState,
  showSavePrompt = false,
  alwaysShowSaveSlide = false,
  locked = false,
  ValidationDialogProps = {},
  hideSubmit = false,
  FormActionProps = {},
  ...props
}: DynamicFormSaveButtonsProps) => {
  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

  const formState = useFormState(handlers.methods);
  const promptSave = formState.isDirty;

  const actionProps = { ...props, ...FormActionProps };

  // TODO: Handle save draft
  const handleSaveDraft = useCallback(() => {
    if (!onSaveDraft) return;
    onSaveDraft(handlers.getCleanedValues());
  }, [onSaveDraft, handlers]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(
    handlers.methods.handleSubmit((values, event) => {
      onSubmit({
        values: handlers.getCleanedValues(),
        confirmed: false,
        event: event?.nativeEvent as React.MouseEvent<HTMLButtonElement>,
      });
    }),
    [onSubmit, handlers.getCleanedValues]
  );

  const handleConfirm = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onSubmit({
        values: handlers.getCleanedValues(),
        confirmed: true,
        event,
      });
    },
    [onSubmit, handlers]
  );

  const { renderValidationDialog, validationDialogVisible } =
    useValidationDialog({ errorState });

  const saveButtons = (
    <FormActions
      onSubmit={handleSubmit}
      onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
      disabled={locked || !!loading || validationDialogVisible}
      loading={loading}
      {...actionProps}
    />
  );

  return (
    <>
      {!alwaysShowSaveSlide && !hideSubmit && (
        <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
          {saveButtons}
        </Box>
      )}
      {renderValidationDialog({
        onConfirm: handleConfirm,
        loading: loading || false,
        confirmText: actionProps?.submitButtonText || 'Confirm',
        ...ValidationDialogProps,
      })}
      {(alwaysShowSaveSlide || (showSavePrompt && !isSaveButtonVisible)) && (
        <SaveSlide
          in={alwaysShowSaveSlide || (promptSave && !isSaveButtonVisible)}
          appear
          padBody
          timeout={300}
          direction='up'
          loading={loading}
        >
          {saveButtons}
        </SaveSlide>
      )}
    </>
  );
};

export default DynamicFormSaveButtons;
