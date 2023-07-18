import { QueryOptions } from '@apollo/client';
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

import useDynamicFields from '../hooks/useDynamicFields';
import { DynamicFormContext } from '../hooks/useDynamicFormContext';
import usePreloadPicklists from '../hooks/usePreloadPicklists';
import {
  ChangeType,
  FormActionTypes,
  FormValues,
  PickListArgs,
} from '../types';

import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';

import Loading from '@/components/elements/Loading';
import useElementInView from '@/hooks/useElementInView';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ValidationDialogProps } from '@/modules/errors/components/ValidationDialog';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import { ErrorState, hasErrors } from '@/modules/errors/util';
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
  definition: FormDefinitionJson;
  onSubmit: DynamicFormOnSubmit;
  onSaveDraft?: (values: FormValues, onSuccess?: VoidFunction) => void;
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
    'errorState' | 'open' | 'onConfirm' | 'onCancel' | 'loading'
  >;
  hideSubmit?: boolean;
  loadingElement?: JSX.Element;
  picklistQueryOptions?: Omit<QueryOptions, 'query'>;
}
export interface DynamicFormRef {
  SaveIfDirty: (callback: VoidFunction) => void;
  SubmitIfDirty: (ignoreWarnings: boolean, callback: VoidFunction) => void;
  SubmitForm: VoidFunction;
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
      pickListArgs,
      FormActionProps = {},
      ValidationDialogProps = {},
      hideSubmit = false,
      loadingElement,
      picklistQueryOptions,
    }: DynamicFormProps,
    ref: Ref<DynamicFormRef>
  ) => {
    const { renderFields, getCleanedValues } = useDynamicFields({
      definition,
      initialValues,
    });
    const { loading: pickListsLoading } = usePreloadPicklists({
      definition,
      queryOptions: picklistQueryOptions,
      pickListArgs,
    });

    const [dirty, setDirty] = useState(false);

    const [promptSave, setPromptSave] = useState<boolean | undefined>();

    const saveButtonsRef = React.createRef<HTMLDivElement>();
    const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

    // Expose handle for parent components to initiate a background save (used for household workflow tabs)
    useImperativeHandle(
      ref,
      () => ({
        SubmitForm: () => {
          onSubmit({
            values: getCleanedValues(),
            confirmed: false,
          });
        },
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

    if (pickListsLoading) return loadingElement || <Loading />;

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
              pickListArgs,
              warnIfEmpty,
              locked,
              visible,
            })}
          </DynamicFormContext.Provider>
        </Grid>
        {!alwaysShowSaveSlide && !hideSubmit && (
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
