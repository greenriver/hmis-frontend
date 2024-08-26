import { Box, Grid, Stack } from '@mui/material';
import { isNil } from 'lodash-es';
import React, {
  Ref,
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import useDynamicFields from '../hooks/useDynamicFields';
import { DynamicFormContext } from '../hooks/useDynamicFormContext';
import { ChangeType, FormValues, LocalConstants, PickListArgs } from '../types';

import FormActions, { FormActionProps } from './FormActions';
import SaveSlide from './SaveSlide';

import useElementInView from '@/hooks/useElementInView';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ValidationDialogProps } from '@/modules/errors/components/ValidationDialog';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import { ErrorState, hasErrors } from '@/modules/errors/util';
import { formAutoCompleteOff } from '@/modules/form/util/formUtil';
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
  variant?: 'standard' | 'without_top_level_cards';
}
export interface DynamicFormRef {
  SaveIfDirty: VoidFunction;
  SubmitIfDirty: (ignoreWarnings: boolean) => void;
  SubmitForm: VoidFunction;
}

const DynamicForm = forwardRef(
  (
    {
      clientId,
      definition,
      onSubmit,
      onSaveDraft,
      loading,
      initialValues,
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
      localConstants,
      errorRef,
      onDirty,
      variant = 'standard',
    }: DynamicFormProps,
    ref: Ref<DynamicFormRef>
  ) => {
    const [dirty, setDirty] = useState(false);
    useEffect(() => {
      onDirty?.(dirty);
    }, [dirty, onDirty]);
    const [promptSave, setPromptSave] = useState<boolean | undefined>();

    const onFieldChange = useCallback((type: ChangeType) => {
      if (type === ChangeType.User) {
        setPromptSave(true);
        setDirty(true);
      }
    }, []);

    const { renderFields, getCleanedValues } = useDynamicFields({
      definition,
      initialValues,
      localConstants,
      onFieldChange,
    });

    const saveButtonsRef = React.createRef<HTMLDivElement>();
    const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

    const handleSaveDraft = useCallback(() => {
      if (!onSaveDraft) return;
      onSaveDraft(getCleanedValues(), () => setDirty(false));
    }, [onSaveDraft, getCleanedValues]);

    const handleSubmit = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onSubmit({
          values: getCleanedValues(),
          confirmed: false,
          event,
          onSuccess: () => setDirty(false),
        });
      },
      [onSubmit, getCleanedValues]
    );

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
        SaveIfDirty: () => {
          if (!dirty || locked) return;
          handleSaveDraft();
        },
        SubmitIfDirty: (ignoreWarnings: boolean) => {
          if (!onSubmit || !dirty || locked) return;
          onSubmit({
            values: getCleanedValues(),
            confirmed: ignoreWarnings,
            onSuccess: () => setDirty(false),
          });
        },
      }),
      [onSubmit, getCleanedValues, dirty, locked, handleSaveDraft]
    );

    useEffect(() => {
      if (isNil(promptSave)) return;
      setPromptSave(!isSaveButtonVisible);
    }, [isSaveButtonVisible, promptSave]);

    const handleConfirm = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        onSubmit({
          values: getCleanedValues(),
          confirmed: true,
          event,
          onSuccess: () => setDirty(false),
        });
      },
      [onSubmit, getCleanedValues]
    );

    const { renderValidationDialog, validationDialogVisible } =
      useValidationDialog({ errorState });

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
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        autoComplete={formAutoCompleteOff}
      >
        <Grid
          container
          direction='column'
          spacing={2}
          sx={
            variant === 'without_top_level_cards'
              ? { '.HmisForm-card': { px: 0, pt: 1, pb: 0, border: 'unset' } }
              : undefined
          }
        >
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
            {renderFields({
              itemChanged: handleChangeCallback,
              severalItemsChanged: handleChangeCallback,
              clientId,
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
            padBody
            timeout={300}
            direction='up'
            loading={loading}
          >
            {saveButtons}
          </SaveSlide>
        )}
      </form>
    );
  }
);

export default DynamicForm;
