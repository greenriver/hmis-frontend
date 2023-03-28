import { Box, Grid } from '@mui/material';
import { isNil } from 'lodash-es';
import React, {
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

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
  errors?: ValidationError[];
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
  FormWarningDialogProps?: Omit<
    FormWarningDialogProps,
    'warnings' | 'open' | 'onConfirm' | 'onCancel' | 'loading'
  >;
}
export interface DynamicFormRef {
  SaveIfDirty: (callback: VoidFunction) => void;
  SubmitIfDirty: (callback: VoidFunction) => void;
}

const DynamicForm = forwardRef(
  (
    {
      definition,
      onSubmit,
      onSaveDraft,
      loading,
      initialValues = {},
      errors: validations,
      showSavePrompt = false,
      alwaysShowSaveSlide = false,
      horizontal = false,
      warnIfEmpty = false,
      locked = false,
      visible = true,
      pickListRelationId,
      FormActionProps = {},
      FormWarningDialogProps = {},
    }: DynamicFormProps,
    ref: Ref<DynamicFormRef>
  ) => {
    const { renderFields, getCleanedValues } = useDynamicFormFields({
      definition,
      initialValues,
    });
    const { errors, warnings } = useValidations(validations);

    const [dirty, setDirty] = useState(false);

    const [promptSave, setPromptSave] = useState<boolean | undefined>();
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const saveButtonsRef = React.createRef<HTMLDivElement>();
    const isSaveButtonVisible = useElementInView(saveButtonsRef, '200px');

    useImperativeHandle(
      ref,
      () => ({
        SaveIfDirty: (onSuccessCallback) => {
          if (!onSaveDraft || !dirty) return;
          onSaveDraft(getCleanedValues(), () => {
            setDirty(false);
            onSuccessCallback();
          });
        },
        SubmitIfDirty: (onSuccessCallback) => {
          if (!onSubmit || !dirty) return;
          onSubmit({
            values: getCleanedValues(),
            confirmed: false,
            onSuccess: () => {
              setDirty(false);
              onSuccessCallback();
            },
          });
        },
      }),
      [dirty, getCleanedValues, onSaveDraft, onSubmit]
    );

    useEffect(() => {
      if (isNil(promptSave)) return;
      setPromptSave(!isSaveButtonVisible);
    }, [isSaveButtonVisible, promptSave]);

    useEffect(() => {
      // if we have warnings and no errors, show dialog. otherwise hide it.
      setShowConfirmDialog(warnings.length > 0 && errors.length === 0);
    }, [errors, warnings]);

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

    const handleSaveDraft = useCallback(
      (onSuccess?: VoidFunction) => {
        if (!onSaveDraft) return;
        onSaveDraft(getCleanedValues(), onSuccess);
      },
      [onSaveDraft, getCleanedValues]
    );

    const handleChangeCallback = useCallback(() => {
      setPromptSave(true);
      setDirty(true);
    }, []);

    const saveButtons = (
      <FormActions
        onSubmit={handleSubmit}
        onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
        disabled={locked || !!loading || showConfirmDialog}
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
            itemChanged: handleChangeCallback,
            severalItemsChanged: handleChangeCallback,
            errors,
            warnings,
            horizontal,
            pickListRelationId,
            warnIfEmpty,
            locked,
            visible,
          })}
        </Grid>
        {!alwaysShowSaveSlide && (
          <Box ref={saveButtonsRef} sx={{ mt: 3 }}>
            {saveButtons}
          </Box>
        )}

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
