import { TypedDocumentNode } from '@apollo/client';
import {
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
} from '@mui/material';
import { ReactNode, useCallback, useRef, useState } from 'react';

import { DynamicFormProps, DynamicFormRef } from '../components/DynamicForm';
import FormDialogActionContent from '../components/FormDialogActionContent';
import StaticForm from '../components/StaticForm';
import { FormValues, LocalConstants, PickListArgs } from '../types';

import CommonDialog from '@/components/elements/CommonDialog';

import { StaticFormRole, ValidationError } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

type RenderFormDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors' | 'pickListArgs'
> & {
  title: ReactNode;
  otherActions?: ReactNode;
  DialogProps?: Omit<DialogProps, 'open'>;
};

interface Args<TData, TVariables> {
  formRole: StaticFormRole;
  initialValues?: Record<string, any>;
  mutationDocument: TypedDocumentNode<TData, TVariables>;
  getErrors: (data: TData) => ValidationError[];
  getVariables: (values: FormValues, confirmed?: boolean) => TVariables;
  onCompleted?: (data: TData) => void;
  pickListArgs?: PickListArgs;
  onClose?: VoidFunction;
  localConstants?: LocalConstants;
}
export function useStaticFormDialog<
  TData extends { __typename?: 'Mutation' },
  TVariables extends { input: { [key: string]: any } },
>({
  formRole,
  onClose,
  mutationDocument,
  getErrors,
  getVariables,
  onCompleted,
  localConstants,
  initialValues,
  pickListArgs,
}: Args<TData, TVariables>) {
  const errorRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);
  const formRef = useRef<DynamicFormRef>(null);
  const [loading, setLoading] = useState(false);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setLoading(false);
    // setErrors(emptyErrorState);
    if (onClose) onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!formRef.current) return;
    setLoading(true);
    formRef.current.SubmitForm();
  }, []);

  const renderFormDialog = useCallback(
    ({ title, otherActions, DialogProps, ...props }: RenderFormDialogProps) => {
      if (!dialogOpen) return null;

      return (
        <CommonDialog
          open={!!dialogOpen}
          fullWidth
          onClose={closeDialog}
          {...DialogProps}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mb: 2, mt: 0 }}>
              <Grid item xs>
                <StaticForm
                  role={formRole}
                  initialValues={initialValues}
                  mutationDocument={mutationDocument}
                  getVariables={getVariables}
                  getErrors={getErrors}
                  errorRef={errorRef}
                  localConstants={localConstants}
                  formRef={formRef}
                  onCompleted={(data: TData) => {
                    setLoading(false);
                    if (onCompleted) onCompleted(data);
                    if (getErrors(data).length === 0) closeDialog();
                  }}
                  DynamicFormProps={{
                    FormActionProps: {
                      onDiscard: () => setDialogOpen(false),
                      ...props.FormActionProps,
                    },
                    variant: 'without_top_level_cards',
                    hideSubmit: true,
                    pickListArgs,
                    ...props,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <FormDialogActionContent
              onSubmit={handleSubmit}
              onDiscard={closeDialog}
              discardButtonText={props.discardButtonText}
              submitButtonText={props.submitButtonText}
              submitLoading={loading}
              otherActions={otherActions}
            />
          </DialogActions>
        </CommonDialog>
      );
    },
    [
      closeDialog,
      dialogOpen,
      formRole,
      getErrors,
      getVariables,
      handleSubmit,
      initialValues,
      loading,
      localConstants,
      mutationDocument,
      onCompleted,
      pickListArgs,
    ]
  );
  return {
    openFormDialog,
    renderFormDialog,
    closeDialog,
  };
}
