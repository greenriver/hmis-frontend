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
import { SubmitFormAllowedTypes } from '../types';

import {
  DynamicFormHandlerArgs,
  useDynamicFormHandlersForRecord,
} from './useDynamicFormHandlersForRecord';
import useFormDefinition from './useFormDefinition';

import CommonDialog from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';
import { emptyErrorState } from '@/modules/errors/util';
import { formDefinitionForModal } from '@/modules/form/util/formUtil';
import { FormRole, ItemType } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

type RenderFormDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors'
> & {
  title: ReactNode;
  DialogProps?: Omit<DialogProps, 'open'>;
};

interface Args<T> extends Omit<DynamicFormHandlerArgs<T>, 'formDefinition'> {
  formRole: FormRole;
  onClose?: VoidFunction;
}
export function useFormDialog<T extends SubmitFormAllowedTypes>({
  onCompleted,
  formRole,
  onClose,
  record,
  localConstants,
  inputVariables,
}: Args<T>) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);

  const formRef = useRef<DynamicFormRef>(null);

  const { formDefinition, loading: definitionLoading } =
    useFormDefinition(formRole);

  const hookArgs = useMemo(
    () => ({
      record,
      localConstants,
      inputVariables,
      formDefinition,
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

  const formJson = useMemo(
    () => formDefinitionForModal(formDefinition?.definition),
    [formDefinition]
  );

  const renderFormDialog = useCallback(
    ({ title, DialogProps, ...props }: RenderFormDialogProps) => {
      if (!dialogOpen) return null;
      if (!definitionLoading && !formDefinition) {
        throw new Error(`Form not found: ${formRole} `);
      }

      const hasTopLevelGroup = (formJson?.item || []).find(
        ({ type }) => type === ItemType.Group
      );

      return (
        <CommonDialog
          open={!!dialogOpen}
          fullWidth
          onClose={closeDialog}
          {...DialogProps}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: hasTopLevelGroup
                ? 'background.default'
                : undefined,
            }}
          >
            {definitionLoading ? (
              <Loading />
            ) : formJson ? (
              <Grid container spacing={2} sx={{ mb: 2, mt: 0 }}>
                <Grid item xs>
                  <DynamicForm
                    ref={formRef}
                    definition={formJson}
                    onSubmit={onSubmit}
                    initialValues={initialValues}
                    loading={submitLoading}
                    errors={errors}
                    localConstants={localConstants}
                    {...props}
                    FormActionProps={{
                      onDiscard: () => setDialogOpen(false),
                      ...props.FormActionProps,
                    }}
                    ValidationDialogProps={{
                      ...props.ValidationDialogProps,
                    }}
                    hideSubmit
                    picklistQueryOptions={{ fetchPolicy: 'cache-first' }}
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
      formJson,
      formRole,
      initialValues,
      localConstants,
      onSubmit,
      submitLoading,
    ]
  );
  return {
    openFormDialog,
    renderFormDialog,
  };
}
