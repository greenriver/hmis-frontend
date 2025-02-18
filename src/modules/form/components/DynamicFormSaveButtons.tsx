import { Box } from '@mui/material';
import React, { useCallback } from 'react';
import { useFormState } from 'react-hook-form';

import { FormDefinitionHandlers } from '../hooks/useFormDefinitionHandlers';
import { FormValues } from '../types';

import { DynamicFormOnSubmit } from './DynamicForm';
import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';

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

const DynamicFormSaveButtons: React.FC<DynamicFormSaveButtonsProps> = ({
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
}) => {
  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

  const formState = useFormState(handlers.methods);
  const promptSave = formState.isDirty;

  const actionProps = { ...props, ...FormActionProps };

  const handleSubmit = handlers.methods.handleSubmit;
  const { getValuesForSubmit } = handlers;

  const doSubmit = useCallback(
    (confirmed: boolean) => {
      return handleSubmit(() => {
        onSubmit({
          ...getValuesForSubmit(),
          confirmed,
        });
      })();
    },
    [getValuesForSubmit, handleSubmit, onSubmit]
  );

  const handleUnconfirmedSubmit = useCallback(
    () => doSubmit(false),
    [doSubmit]
  );
  const handleConfirmedSubmit = useCallback(() => doSubmit(true), [doSubmit]);
  const handleSaveDraft = useCallback(() => {
    if (!onSaveDraft) return;
    return handleSubmit(() => {
      onSaveDraft({
        ...getValuesForSubmit(),
      });
    })();
  }, [getValuesForSubmit, handleSubmit, onSaveDraft]);

  const { renderValidationDialog, validationDialogVisible } =
    useValidationDialog({ errorState });

  const saveButtons = (
    <FormActions
      onSubmit={handleUnconfirmedSubmit}
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
        onConfirm: handleConfirmedSubmit,
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
