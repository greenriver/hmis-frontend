import { Box, Grid, Stack } from '@mui/material';
import { isNil } from 'lodash-es';
import React, {
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import ErrorAlert from '../../errors/components/ErrorAlert';
import { ValidationDialogProps } from '../../errors/components/ValidationDialog';
import useDynamicFields from '../hooks/useDynamicFields';
import useElementInView from '../hooks/useElementInView';
import { ChangeType, FormActionTypes, FormValues } from '../types';

import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';
import { DynamicFormContext } from './useDynamicFormContext';

import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import { ErrorState, hasErrors } from '@/modules/errors/util';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface DynamicFormSubmitInput {
  values: FormValues;
  confirmed?: boolean;
  event?: React.MouseEvent<HTMLButtonElement>;
  onSuccess?: VoidFunction;
}

export type DynamicFormOnSubmit = (input: DynamicFormSubmitInput) => void;

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
  errors: ErrorState;
  showSavePrompt?: boolean;
  alwaysShowSaveSlide?: boolean;
  horizontal?: boolean;
  pickListRelationId?: string;
  warnIfEmpty?: boolean;
  locked?: boolean;
  visible?: boolean;
  FormActionProps?: Omit<
    FormActionProps,
    'loading' | 'onSubmit' | 'onSaveDraft'
  >;
  ValidationDialogProps?: Omit<
    ValidationDialogProps,
    'errorState' | 'open' | 'onConfirm' | 'onCancel' | 'loading'
  >;
}
export interface DynamicFormRef {
  SaveIfDirty: (callback: VoidFunction) => void;
  SubmitIfDirty: (ignoreWarnings: boolean, callback: VoidFunction) => void;
}

const DynamicForm = forwardRef(
  (
    {
      definition,
      onSubmit,
      onSaveDraft,
      loading,
      initialValues = {},
      errors: errorState,
      showSavePrompt = false,
      alwaysShowSaveSlide = false,
      horizontal = false,
      warnIfEmpty = false,
      locked = false,
      visible = true,
      pickListRelationId,
      FormActionProps = {},
      ValidationDialogProps = {},
    }: DynamicFormProps,
    ref: Ref<DynamicFormRef>
  ) => {
    const { renderFields, getCleanedValues } = useDynamicFields({
      definition,
      initialValues,
    });
    const [dirty, setDirty] = useState(false);

    const [promptSave, setPromptSave] = useState<boolean | undefined>();

    const saveButtonsRef = React.createRef<HTMLDivElement>();
    const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

    // Expose handle for parent components to initiate a background save (used for household workflow tabs)
    useImperativeHandle(
      ref,
      () => ({
        SaveIfDirty: (onSuccessCallback) => {
          if (!onSaveDraft || !dirty || locked) return;
          onSaveDraft(getCleanedValues(), () => {
            setDirty(false);
            onSuccessCallback();
          });
        },
        SubmitIfDirty: (ignoreWarnings: boolean, onSuccessCallback) => {
          if (!onSubmit || !dirty || locked) return;
          onSubmit({
            values: getCleanedValues(),
            confirmed: ignoreWarnings,
            onSuccess: () => {
              setDirty(false);
              onSuccessCallback();
            },
          });
        },
      }),
      [dirty, getCleanedValues, onSaveDraft, onSubmit, locked]
    );

    useEffect(() => {
      if (isNil(promptSave)) return;
      setPromptSave(!isSaveButtonVisible);
    }, [isSaveButtonVisible, promptSave]);

    const handleSubmit = useCallback(
      (
        event: React.MouseEvent<HTMLButtonElement>,
        onSuccess?: VoidFunction
      ) => {
        onSubmit({
          values: getCleanedValues(),
          confirmed: false,
          event,
          onSuccess,
        });
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

        onSubmit({
          values: getCleanedValues(),
          confirmed: true,
          event,
          onSuccess,
        });
      },
      [onSubmit, getCleanedValues, FormActionProps]
    );

    const { renderValidationDialog, validationDialogVisible } =
      useValidationDialog({ errorState });
    const handleSaveDraft = useCallback(
      (onSuccess?: VoidFunction) => {
        if (!onSaveDraft) return;
        onSaveDraft(getCleanedValues(), onSuccess);
      },
      [onSaveDraft, getCleanedValues]
    );

    const handleChangeCallback = useCallback(
      ({ type }: { type: ChangeType }) => {
        if (type === ChangeType.User) {
          setPromptSave(true);
          setDirty(true);
        }
      },
      []
    );

    const saveButtons = (
      <FormActions
        onSubmit={handleSubmit}
        onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
        disabled={locked || !!loading || validationDialogVisible}
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
          {hasErrors(errorState) && (
            <Grid item>
              <Stack gap={2}>
                <ApolloErrorAlert error={errorState.apolloError} />
                <ErrorAlert errors={errorState.errors} fixable />
              </Stack>
            </Grid>
          )}
          <DynamicFormContext.Provider value={{ getCleanedValues, definition }}>
            {renderFields({
              itemChanged: handleChangeCallback,
              severalItemsChanged: handleChangeCallback,
              errors: errorState.errors,
              warnings: errorState.warnings,
              horizontal,
              pickListRelationId,
              warnIfEmpty,
              locked,
              visible,
            })}
          </DynamicFormContext.Provider>
        </Grid>
        {!alwaysShowSaveSlide && (
          <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
            {saveButtons}
          </Box>
        )}
        {renderValidationDialog({
          onConfirm: handleConfirm,
          loading: loading || false,
          confirmText: FormActionProps?.submitButtonText || 'Confirm',
          ...ValidationDialogProps,
        })}
        {(alwaysShowSaveSlide || (showSavePrompt && !isSaveButtonVisible)) && (
          <SaveSlide
            in={alwaysShowSaveSlide || (promptSave && !isSaveButtonVisible)}
            appear
            timeout={300}
            direction='up'
          >
            {saveButtons}
          </SaveSlide>
        )}
      </Box>
    );
  }
);

export default DynamicForm;
