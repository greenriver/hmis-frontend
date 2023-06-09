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
import { ReactNode, useCallback, useRef, useState } from 'react';

import DynamicForm, {
  DynamicFormOnSubmit,
  DynamicFormProps,
  DynamicFormRef,
} from '../components/DynamicForm';
import { LocalConstants, SubmitFormAllowedTypes } from '../types';
import {
  createHudValuesForSubmit,
  createValuesForSubmit,
} from '../util/formUtil';

import useFormDefinition from './useFormDefinition';
import useInitialFormValues from './useInitialFormValues';

import CommonDialog from '@/components/elements/CommonDialog';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { FormInput, FormRole, useSubmitFormMutation } from '@/types/gqlTypes';
import { PartialPick } from '@/utils/typeUtil';

interface Args<T> {
  formRole: FormRole;
  record?: T;
  onCompleted?: (data: T) => void;
  localConstants?: LocalConstants;
  inputVariables?: Omit<
    FormInput,
    'confirmed' | 'formDefinitionId' | 'values' | 'hudValues' | 'recordId'
  >;
}

type RenderFormDialogProps = PartialPick<
  DynamicFormProps,
  'onSubmit' | 'definition' | 'errors'
> & {
  title: ReactNode;
};

export function useFormDialog<T extends SubmitFormAllowedTypes>({
  formRole,
  record,
  onCompleted,
  localConstants,
  inputVariables,
}: Args<T>) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const openFormDialog = useCallback(() => setDialogOpen(true), []);
  const {
    formDefinition,
    itemMap,
    loading: definitionLoading,
  } = useFormDefinition(formRole);
  const formRef = useRef<DynamicFormRef>(null);
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [submitLoading, setSubmitLoading] = useState(false);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setErrors(emptyErrorState);
    setSubmitLoading(false);
  }, []);

  const [submitForm, { loading: saveLoading }] = useSubmitFormMutation({
    onCompleted: (data) => {
      const errors = data.submitForm?.errors || [];
      setSubmitLoading(false);
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        const record = data.submitForm?.record || undefined;
        if (record && onCompleted) onCompleted(record as T);
        closeDialog();
      }
    },
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
      window.scrollTo(0, 0);
    },
  });

  const initialValues = useInitialFormValues({
    record,
    itemMap,
    definition: formDefinition?.definition,
    localConstants,
  });

  const submitHandler: DynamicFormOnSubmit = useCallback(
    ({ values, confirmed = false }) => {
      if (!formDefinition) return;
      const input = {
        formDefinitionId: formDefinition.id,
        values: createValuesForSubmit(values, formDefinition.definition),
        hudValues: createHudValuesForSubmit(values, formDefinition.definition),
        recordId: record?.id,
        confirmed,
        ...inputVariables,
      };
      setErrors(emptyErrorState);
      void submitForm({ variables: { input: { input } } });
    },
    [formDefinition, inputVariables, submitForm, record]
  );

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
              {formDefinition && (
                <DynamicForm
                  ref={formRef}
                  definition={formDefinition.definition}
                  onSubmit={submitHandler}
                  initialValues={initialValues}
                  loading={saveLoading}
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
              )}
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
                onClick={() => {
                  if (!formRef.current) return;
                  setSubmitLoading(true);
                  formRef.current.SubmitForm();
                }}
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
