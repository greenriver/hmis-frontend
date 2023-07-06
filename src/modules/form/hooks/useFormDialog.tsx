import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
} from '@mui/material';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';

import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '../components/DynamicForm';
import { SubmitFormAllowedTypes } from '../types';

import {
  DynamicFormHandlerArgs,
  useDynamicFormHandlersForRecord,
} from './useDynamicFormHandlersForRecord';
import useFormDefinition from './useFormDefinition';

import CommonDialog from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import { emptyErrorState } from '@/modules/errors/util';
import { FormRole } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

type RenderFormDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors'
> & {
  title: ReactNode;
};

interface Args<T> extends DynamicFormHandlerArgs<T> {
  formRole: FormRole;
}
export function useFormDialog<T extends SubmitFormAllowedTypes>({
  onCompleted,
  formRole,
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
        if (onCompleted) onCompleted(data);
        setDialogOpen(false);
      },
    };
  }, [args, onCompleted, formDefinition]);

  const { initialValues, errors, onSubmit, submitLoading, setErrors } =
    useDynamicFormHandlersForRecord(hookArgs);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setErrors(emptyErrorState);
  }, [setErrors]);

  const renderFormDialog = ({ title, ...props }: RenderFormDialogProps) => {
    if (definitionLoading) return <Loading />;
    if (!formDefinition) return <NotFound text='Form definition not found.' />;
    if (!dialogOpen) return null;

    return (
      <CommonDialog
        open={!!dialogOpen}
        fullWidth
        onClose={closeDialog}
        maxWidth='lg'
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: 'background.default',
          }}
        >
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Stack
            direction='row'
            justifyContent={'space-between'}
            sx={{ width: '100%' }}
          >
            <Box></Box>
            <Stack gap={3} direction='row'>
              <Button
                onClick={closeDialog}
                variant='gray'
                data-testid='cancelDialogAction'
              >
                {props.discardButtonText || 'Cancel'}
              </Button>
              <LoadingButton
                onClick={() => formRef.current && formRef.current.SubmitForm()}
                type='submit'
                loading={submitLoading}
                data-testid='confirmDialogAction'
                sx={{ minWidth: '120px' }}
              >
                {props.submitButtonText || 'Save'}
              </LoadingButton>
            </Stack>
          </Stack>
        </DialogActions>
      </CommonDialog>
    );
  };
  return {
    openFormDialog,
    renderFormDialog,
  };
}
