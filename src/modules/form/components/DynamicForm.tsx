import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useDynamicFormFields from '../hooks/useDynamicFormFields';
import useElementInView from '../hooks/useElementInView';
import { FormValues } from '../util/formUtil';
import { transformSubmitValues } from '../util/recordFormUtil';

import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';

import ConfirmationDialog from '@/components/elements/ConfirmDialog';
import { FormDefinitionJson, ValidationError } from '@/types/gqlTypes';

export interface Props
  extends Omit<
    FormActionProps,
    'disabled' | 'loading' | 'onSubmit' | 'onSaveDraft'
  > {
  definition: FormDefinitionJson;
  onSubmit: (values: FormValues, confirmed?: boolean) => void;
  onSaveDraft?: (values: FormValues) => void;
  loading?: boolean;
  initialValues?: Record<string, any>;
  errors?: ValidationError[];
  warnings?: ValidationError[];
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
  errors = [],
  warnings = [],
  showSavePrompt = false,
  horizontal = false,
  pickListRelationId,
}) => {
  const navigate = useNavigate();
  const { renderFields, values, getCleanedValues } = useDynamicFormFields({
    definition,
    initialValues,
  });

  const [promptSave, setPromptSave] = useState<boolean | undefined>();

  const [dialogDismissed, setDialogDismissed] = useState<boolean>(false);
  const saveButtonsRef = React.createRef<HTMLDivElement>();
  const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

  useEffect(() => {
    if (isNil(promptSave)) return;
    setPromptSave(!isSaveButtonVisible);
  }, [isSaveButtonVisible, promptSave]);

  const handleSubmit = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setDialogDismissed(false);
      const valuesToSubmit = getCleanedValues();

      // FOR DEBUGGING: if ctrl-click, just log values and don't submit anything
      if (
        import.meta.env.MODE !== 'production' &&
        (event.ctrlKey || event.metaKey)
      ) {
        console.log('%c CURRENT FORM STATE:', 'color: #BB7AFF');
        console.log(valuesToSubmit);
        const hudValues = transformSubmitValues({
          definition,
          values: valuesToSubmit,
        });
        window.debug = { hudValues };
        console.log(JSON.stringify(hudValues, null, 2));
      } else {
        onSubmit(valuesToSubmit);
      }
    },
    [onSubmit, definition, getCleanedValues]
  );

  const handleConfirm = useCallback(
    () => onSubmit(values, true),
    [values, onSubmit]
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
      disabled={!!loading || (warnings.length > 0 && !dialogDismissed)}
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
            <Alert severity='error' sx={{ mb: 1 }}>
              Please fix outstanding errors:
              <Box component='ul' sx={{ pl: 2 }} data-testid='formErrorAlert'>
                {errors.map(({ message, fullMessage }) => (
                  <li key={fullMessage || message}>{fullMessage || message}</li>
                ))}
              </Box>
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

      {warnings.length > 0 && !dialogDismissed && (
        <ConfirmationDialog
          id='confirmSubmit'
          open
          title='Confirm Change'
          onConfirm={handleConfirm}
          onCancel={() => setDialogDismissed(true)}
          loading={loading || false}
        >
          <Stack>
            {warnings?.map((e) => (
              <Typography key={e.fullMessage}>{e.fullMessage}</Typography>
            ))}
          </Stack>
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

/**
 * Wrapper component to do some pre computation on form definition
 */
// const DynamicFormWithComputedData = ({
//   definition,
//   initialValues,
//   ...props
// }: Props) => {
//   const {
//     items: itemMap,
//     autofillMap: autofillDependencyMap,
//     enabledMap: enabledDependencyMap,
//     disabled: initiallyDisabledLinkIds,
//   } = useComputedData({ definition, initialValues })

//   return (
//     <DynamicForm
//       initialValues={initialValues}
//       definition={definition}
//       itemMap={itemMap}
//       autofillDependencyMap={autofillDependencyMap}
//       enabledDependencyMap={enabledDependencyMap}
//       initiallyDisabledLinkIds={initiallyDisabledLinkIds}
//       {...props}
//     />
//   );
// };

export default DynamicForm;
