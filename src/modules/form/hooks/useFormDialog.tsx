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

import CommonDialog from '@/components/elements/CommonDialog';
import { emptyErrorState } from '@/modules/errors/util';

import { FormDefinitionFieldsFragment, ItemType } from '@/types/gqlTypes';
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
  formDefinition?: FormDefinitionFieldsFragment;
  pickListArgs?: PickListArgs;
  onClose?: VoidFunction;
}
export function useFormDialog<T extends SubmitFormAllowedTypes>({
  onCompleted,
  formDefinition,
  onClose,
  record,
  localConstants: localConstantsProp,
  inputVariables,
  pickListArgs,
}: Args<T>) {
  const errorRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);

  const formRef = useRef<DynamicFormRef>(null);

  const localConstants: LocalConstants = useMemo(
    () => ({ ...AlwaysPresentLocalConstants, ...localConstantsProp }),
    [localConstantsProp]
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
      if (!formDefinition) return null; //ok?
      const hasMultipleTopLevelGroups =
        (formDefinition?.definition?.item || []).filter(
          ({ type }) => type === ItemType.Group
        ).length > 1;

      // If there are multiple top level groups, render form "cards" as usual.
      // If not, hide the card formatting.
      const contentSx = hasMultipleTopLevelGroups
        ? {
            backgroundColor: 'background.default',
          }
        : {
            '.HmisForm-card': { px: 0, pt: 1, pb: 0, border: 'unset' },
          };

      return (
        <CommonDialog
          open={!!dialogOpen}
          fullWidth
          onClose={closeDialog}
          {...DialogProps}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent sx={contentSx}>
            <Grid container spacing={2} sx={{ mb: 2, mt: 0 }}>
              <Grid item xs>
                {props.preFormComponent}
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
                  hideSubmit
                  {...props}
                  errorRef={errorRef}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <FormDialogActionContent
              onSubmit={() => formRef.current && formRef.current.SubmitForm()}
              onDiscard={closeDialog}
              discardButtonText={props.discardButtonText}
              submitButtonText={props.submitButtonText}
              submitLoading={submitLoading}
              otherActions={otherActions}
            />
          </DialogActions>
        </CommonDialog>
      );
    },
    [
      closeDialog,
      dialogOpen,
      errors,
      formDefinition,
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
