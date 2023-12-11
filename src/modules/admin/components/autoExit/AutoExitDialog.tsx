import { useApolloClient } from '@apollo/client';
import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import { emptyErrorState, partitionValidations } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import { AutoExitConfigDefinition } from '@/modules/form/data';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { SubmitFormAllowedTypes } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  useCreateAutoExitConfigMutation,
  useGetAutoExitConfigsQuery,
} from '@/types/gqlTypes';

export interface AutoExitDialogProps extends DialogProps {
  autoExitId?: string;
}

const AutoExitDialog: React.FC<AutoExitDialogProps> = ({
  autoExitId,
  ...props
}) => {
  const [errors, setErrors] = useState(emptyErrorState);
  const formDefinition = AutoExitConfigDefinition;

  const client = useApolloClient();
  const { data, loading } = useGetAutoExitConfigsQuery();
  const [mutate, { loading: mutationLoading }] =
    useCreateAutoExitConfigMutation({
      onCompleted: (data) => {
        client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'autoExitConfigs' });
        const { errors: remoteErrors = [] } = data?.createAutoExitConfig || {};
        if (remoteErrors.length) {
          setErrors(partitionValidations(remoteErrors));
        } else {
          if (props.onClose) props.onClose({}, 'escapeKeyDown');
        }
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    });
  const autoExit = useMemo(
    () => data?.autoExitConfigs?.nodes?.find((aec) => aec.id === autoExitId),
    [data, autoExitId]
  );

  const initialValues = useInitialFormValues({
    definition: formDefinition,
    record: autoExit as unknown as SubmitFormAllowedTypes,
  });

  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      const input = transformSubmitValues({
        definition: formDefinition,
        values,
      });
      mutate({ variables: { input } });
    },
    [formDefinition, mutate]
  );

  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>{autoExitId ? 'Edit' : 'New'} Auto Exit Config</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <DynamicForm
            definition={formDefinition}
            FormActionProps={{
              submitButtonText: autoExitId ? 'Save' : 'Create',
              discardButtonText: 'Cancel',
            }}
            initialValues={
              autoExitId ? initialValues : { lengthOfAbsenceDays: 30 }
            }
            onSubmit={handleSubmit}
            loading={loading || mutationLoading}
            errors={errors}
          />
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default AutoExitDialog;
