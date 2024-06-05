import {
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
} from '@mui/material';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '../components/DynamicForm';
import FormDialogActionContent from '../components/FormDialogActionContent';
import { LocalConstants, PickListArgs, SubmitFormAllowedTypes } from '../types';

import { AlwaysPresentLocalConstants } from '../util/formUtil';
import {
  DynamicFormHandlerArgs,
  useDynamicFormHandlersForRecord,
} from './useDynamicFormHandlersForRecord';
import useFormDefinition from './useFormDefinition';

import CommonDialog from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';
import { emptyErrorState } from '@/modules/errors/util';

import {
  FormDefinitionFieldsFragment,
  ItemType,
  RecordFormRole,
} from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

export type RenderFormDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors' | 'pickListArgs'
> & {
  title: ReactNode;
  otherActions?: ReactNode;
  DialogProps?: Omit<DialogProps, 'open'>;
  preFormComponent?: ReactNode;
};

interface Args<T> extends Omit<DynamicFormHandlerArgs<T>, 'formDefinition'> {
  formRole: RecordFormRole;
  pickListArgs?: PickListArgs;
  onClose?: VoidFunction;
  localDefinition?: FormDefinitionFieldsFragment;
  projectId?: string; // Project context for fetching form definition
}
export function useFormDialog<T extends SubmitFormAllowedTypes>({
  onCompleted,
  formRole,
  onClose,
  record,
  localConstants: localConstantsProp,
  inputVariables,
  localDefinition,
  pickListArgs,
  projectId,
}: Args<T>) {
  const errorRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);

  const formRef = useRef<DynamicFormRef>(null);

  const localConstants: LocalConstants = useMemo(
    () => ({
      ...AlwaysPresentLocalConstants,
      projectId,
      ...localConstantsProp,
    }),
    [localConstantsProp, projectId]
  );

  const { formDefinition, loading: definitionLoading } = useFormDefinition(
    {
      role: formRole,
      // hack: pull project id from one of the existing args, if it exists.
      // this project will be used to evaluate and "rules" on the resolved form definition.
      projectId:
        projectId || localConstants?.projectId || inputVariables?.projectId,
    },
    localDefinition
  );

  const hookArgs = useMemo(
    () => ({
      record,
      localConstants,
      inputVariables,
      formDefinition,
      errorRef,
      onCompleted: (data: T) => {
        setDialogOpen(false);
        if (onCompleted) onCompleted(data);
        if (onClose) onClose();
      },
    }),
    [
      record,
      localConstants,
      inputVariables,
      onCompleted,
      formDefinition,
      onClose,
    ]
  );

  const { initialValues, errors, onSubmit, submitLoading, setErrors } =
    useDynamicFormHandlersForRecord(hookArgs);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setErrors(emptyErrorState);
    if (onClose) onClose();
  }, [setErrors, onClose]);

  const renderFormDialog = useCallback(
    ({ title, otherActions, DialogProps, ...props }: RenderFormDialogProps) => {
      if (!dialogOpen) return null;
      if (!definitionLoading && !formDefinition) {
        throw new Error(`Form not found: ${formRole} `);
      }

      const hasMultipleTopLevelGroups =
        (formDefinition?.definition?.item || []).filter(
          ({ type }) => type === ItemType.Group
        ).length > 1;

      // Variant depends on whether this form has multiple sections (for example Client)
      const variant = hasMultipleTopLevelGroups
        ? 'standard'
        : 'without_top_level_cards';

      return (
        <CommonDialog
          open={!!dialogOpen}
          fullWidth
          onClose={closeDialog}
          {...DialogProps}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent
            sx={
              variant === 'standard'
                ? { backgroundColor: 'background.default' }
                : undefined
            }
          >
            {definitionLoading ? (
              <Loading />
            ) : formDefinition ? (
              <Grid
                container
                direction='column'
                spacing={2}
                sx={{ mb: 2, mt: 0 }}
              >
                {props.preFormComponent && (
                  <Grid item>{props.preFormComponent}</Grid>
                )}
                <Grid item xs>
                  <DynamicForm
                    ref={formRef}
                    definition={formDefinition.definition}
                    onSubmit={onSubmit}
                    initialValues={initialValues}
                    loading={submitLoading}
                    errors={errors}
                    localConstants={localConstants}
                    pickListArgs={pickListArgs}
                    FormActionProps={{
                      onDiscard: () => setDialogOpen(false),
                      ...props.FormActionProps,
                    }}
                    ValidationDialogProps={{
                      ...props.ValidationDialogProps,
                    }}
                    variant={variant}
                    hideSubmit
                    {...props}
                    errorRef={errorRef}
                  />
                </Grid>
              </Grid>
            ) : null}
          </DialogContent>
          <DialogActions>
            <FormDialogActionContent
              onSubmit={() => formRef.current && formRef.current.SubmitForm()}
              onDiscard={closeDialog}
              discardButtonText={props.discardButtonText}
              submitButtonText={props.submitButtonText}
              submitLoading={submitLoading}
              disabled={definitionLoading}
              otherActions={otherActions}
            />
          </DialogActions>
        </CommonDialog>
      );
    },
    [
      closeDialog,
      definitionLoading,
      dialogOpen,
      errors,
      formDefinition,
      formRole,
      initialValues,
      localConstants,
      onSubmit,
      pickListArgs,
      submitLoading,
    ]
  );
  return {
    openFormDialog,
    renderFormDialog,
    closeDialog,
  };
}
