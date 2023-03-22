import { Box, Grid } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';

import useDynamicFormFields from '../hooks/useDynamicFormFields';
import useElementInView from '../hooks/useElementInView';
import { FormActionTypes } from '../types';
import { FormValues } from '../util/formUtil';

import ErrorAlert from './ErrorAlert';
import FormActions, { FormActionProps } from './FormActions';
import FormWarningDialog, { FormWarningDialogProps } from './FormWarningDialog';
import SaveSlide from './SaveSlide';

import { useValidations } from '@/modules/assessments/components/useValidations';
import { FormDefinitionJson, ValidationError } from '@/types/gqlTypes';

export type DynamicFormOnSubmit = (
  event: React.MouseEvent<HTMLButtonElement>,
  values: FormValues,
  confirmed?: boolean,
  onSuccess?: VoidFunction
) => void;

export interface DynamicFormProps
  extends Omit<
    FormActionProps,
    'disabled' | 'loading' | 'onSubmit' | 'onSaveDraft'
  > {
  definition: FormDefinitionJson;
  onSubmit: DynamicFormOnSubmit;
  onSaveDraft?: (values: FormValues, onSuccess?: VoidFunction) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
  showSavePrompt?: boolean;
  showSavePromptInitial?: boolean;
  horizontal?: boolean;
  pickListRelationId?: string;
  warnIfEmpty?: boolean;
  locked?: boolean;
  visible?: boolean;
  FormActionProps?: Omit<
    FormActionProps,
    'loading' | 'onSubmit' | 'onSaveDraft'
  >;
  FormWarningDialogProps?: Omit<
    FormWarningDialogProps,
    'warnings' | 'open' | 'onConfirm' | 'onCancel' | 'loading'
  >;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  definition,
  onSubmit,
  onSaveDraft,
  loading,
  initialValues = {},
  errors: validations,
  showSavePrompt = false,
  showSavePromptInitial,
  horizontal = false,
  warnIfEmpty = false,
  locked = false,
  visible = true,
  pickListRelationId,
  FormActionProps = {},
  FormWarningDialogProps = {},
}) => {
  const { renderFields, getCleanedValues } = useDynamicFormFields({
    definition,
    initialValues,
  });
  const { errors, warnings } = useValidations(validations);

  const [promptSave, setPromptSave] = useState<boolean | undefined>(
    showSavePromptInitial
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

  useEffect(() => {
    if (isNil(promptSave)) return;
    setPromptSave(!isSaveButtonVisible);
  }, [isSaveButtonVisible, promptSave]);

  useEffect(() => {
    // if we have warnings and no errors, show dialog. otherwise hide it.
    setShowConfirmDialog(warnings.length > 0 && errors.length === 0);
  }, [errors, warnings]);

  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, onSuccess?: VoidFunction) => {
      const valuesToSubmit = getCleanedValues();
      onSubmit(event, valuesToSubmit, false, onSuccess);
    },
    [onSubmit, getCleanedValues]
  );

  const handleConfirm = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      // Hacky why to pull the appropriate onSuccess callback from FormActionProps
      const onSuccess = (FormActionProps.config || []).find(
        (b) => b.action === FormActionTypes.Submit
      )?.onSuccess;

      const valuesToSubmit = getCleanedValues();
      onSubmit(event, valuesToSubmit, true, onSuccess);
    },
    [onSubmit, getCleanedValues, FormActionProps]
  );

  const handleSaveDraft = useCallback(
    (onSuccess?: VoidFunction) => {
      if (!onSaveDraft) return;
      onSaveDraft(getCleanedValues(), onSuccess);
    },
    [onSaveDraft, getCleanedValues]
  );

  const saveButtons = (
    <FormActions
      onSubmit={handleSubmit}
      onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
      disabled={!!loading || showConfirmDialog}
      loading={loading}
      {...FormActionProps}
    />
  );

  return (
    <Box
      component='form'
      onSubmit={(e: React.FormEvent<HTMLDivElement>) => e.preventDefault()}
    >
      <Grid container direction='column' spacing={2}>
        {errors.length > 0 && (
          <Grid item>
            <ErrorAlert errors={errors} />
          </Grid>
        )}
        {renderFields({
          itemChanged: () => setPromptSave(true),
          severalItemsChanged: () => setPromptSave(true),
          errors,
          warnings,
          horizontal,
          pickListRelationId,
          warnIfEmpty,
          locked,
          visible,
        })}
      </Grid>
      <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
        {saveButtons}
      </Box>

      {showConfirmDialog && (
        <FormWarningDialog
          open
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmDialog(false)}
          loading={loading || false}
          confirmText={FormActionProps?.submitButtonText || 'Confirm'}
          warnings={warnings}
          {...FormWarningDialogProps}
        />
      )}

      {showSavePrompt && !isSaveButtonVisible && (
        <SaveSlide
          in={promptSave && !isSaveButtonVisible}
          appear
          timeout={300}
          direction='up'
        >
          {saveButtons}
        </SaveSlide>
      )}
    </Box>
  );
};

export default DynamicForm;
