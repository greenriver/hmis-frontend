import { Alert, AlertTitle, Box, Grid } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useDynamicFormFields from '../hooks/useDynamicFormFields';
import useElementInView from '../hooks/useElementInView';
import { FormValues } from '../util/formUtil';

import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';
import ValidationErrorDisplay, {
  ValidationWarningDisplay,
} from './ValidationErrorDisplay';

import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { useValidations } from '@/modules/assessments/components/useValidations';
import { FormDefinitionJson, ValidationError } from '@/types/gqlTypes';

export type DynamicFormOnSubmit = (
  event: React.MouseEvent<HTMLButtonElement>,
  values: FormValues,
  confirmed?: boolean
) => void;

export interface Props
  extends Omit<
    FormActionProps,
    'disabled' | 'loading' | 'onSubmit' | 'onSaveDraft'
  > {
  definition: FormDefinitionJson;
  onSubmit: DynamicFormOnSubmit;
  onSaveDraft?: (values: FormValues) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
  showSavePrompt?: boolean;
  horizontal?: boolean;
  pickListRelationId?: string;
}

const DynamicForm: React.FC<Props> = ({
  definition,
  onSubmit,
  onSaveDraft,
  onDiscard,
  submitButtonText,
  saveDraftButtonText,
  discardButtonText,
  loading,
  initialValues = {},
  errors: validations,
  showSavePrompt = false,
  horizontal = false,
  pickListRelationId,
}) => {
  const navigate = useNavigate();
  const { renderFields, getCleanedValues } = useDynamicFormFields({
    definition,
    initialValues,
  });
  const { errors, warnings } = useValidations(validations);

  const [promptSave, setPromptSave] = useState<boolean | undefined>();
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
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const valuesToSubmit = getCleanedValues();
      onSubmit(event, valuesToSubmit, false);
    },
    [onSubmit, getCleanedValues]
  );

  const handleSaveDraft = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      if (!onSaveDraft) return;

      onSaveDraft(getCleanedValues());
    },
    [onSaveDraft, getCleanedValues]
  );

  const saveButtons = (
    <FormActions
      onSubmit={handleSubmit}
      onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
      onDiscard={onDiscard || (() => navigate(-1))}
      submitButtonText={submitButtonText}
      saveDraftButtonText={saveDraftButtonText}
      discardButtonText={discardButtonText}
      disabled={!!loading || showConfirmDialog}
      loading={loading}
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
            <Alert severity='error' sx={{ mb: 1 }} data-testid='formErrorAlert'>
              <AlertTitle>Please fix outstanding errors</AlertTitle>
              <ValidationErrorDisplay errors={errors} />
            </Alert>
          </Grid>
        )}
        {renderFields({
          itemChanged: () => setPromptSave(true),
          severalItemsChanged: () => setPromptSave(true),
          errors,
          warnings,
          horizontal,
          pickListRelationId,
        })}
      </Grid>
      <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
        {saveButtons}
      </Box>

      {showConfirmDialog && (
        <ConfirmationDialog
          id='confirmSubmit'
          open
          title='Ignore Warnings?'
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmDialog(false)}
          loading={loading || false}
          confirmText='Submit Assessment'
          sx={{
            '.MuiDialog-paper': {
              minWidth: '400px',
              // backgroundColor: (theme) =>
              //   lighten(theme.palette.warning.light, 0.85),
            },
            '.MuiDialogTitle-root': {
              textTransform: 'unset',
              color: 'text.primary',
              fontSize: 18,
              fontWeight: 800,
            },
          }}
        >
          {warnings.length > 0 && (
            <ValidationWarningDisplay warnings={warnings} />
          )}
        </ConfirmationDialog>
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
