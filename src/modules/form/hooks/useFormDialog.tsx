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
import { FormRole, ItemType } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

type RenderFormDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors'
> & {
  title: ReactNode;
  DialogProps?: Omit<DialogProps, 'open'>;
};

interface Args<T> extends DynamicFormHandlerArgs<T> {
  formRole: FormRole;
  onClose?: VoidFunction;
}
export function useFormDialog<T extends SubmitFormAllowedTypes>({
  onCompleted,
  formRole,
  onClose = () => null,
  ...args
}: Args<T>) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);

  const formRef = useRef<DynamicFormRef>(null);

  const { formDefinition, loading: definitionLoading } =
    useFormDefinition(formRole);

  const hookArgs = useMemo(() => {
    return {
      ...args,
      formDefinition,
      onCompleted: (data: T) => {
        setDialogOpen(false);
        if (onCompleted) onCompleted(data);
        onClose();
      },
    };
  }, [args, onCompleted, formDefinition, onClose]);

  const { initialValues, errors, onSubmit, submitLoading, setErrors } =
    useDynamicFormHandlersForRecord(hookArgs);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setErrors(emptyErrorState);
    onClose();
  }, [setErrors, onClose]);

  const renderFormDialog = ({
    title,
    DialogProps,
    ...props
  }: RenderFormDialogProps) => {
    if (!dialogOpen) return null;
    if (!definitionLoading && !formDefinition) {
      throw new Error(`Form not found: ${formRole} `);
    }
    const hasTopLevelGroup =
      formDefinition &&
      formDefinition.definition.item.find(
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
          ) : formDefinition ? (
            <Grid container spacing={2} sx={{ mb: 2, mt: 0 }}>
              <Grid item xs>
                <DynamicForm
                  ref={formRef}
                  definition={formDefinition.definition}
                  onSubmit={onSubmit}
                  initialValues={initialValues}
                  loading={submitLoading}
                  errors={errors}
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
  };
  return {
    openFormDialog,
    renderFormDialog,
  };
}
