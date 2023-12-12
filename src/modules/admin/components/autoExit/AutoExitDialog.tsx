import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import React, { useMemo } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import StaticForm from '@/modules/form/components/StaticForm';
import {
  CreateAutoExitConfigDocument,
  CreateAutoExitConfigMutation,
  CreateAutoExitConfigMutationVariables,
  StaticFormRole,
  UpdateAutoExitConfigDocument,
  UpdateAutoExitConfigMutation,
  UpdateAutoExitConfigMutationVariables,
  useGetAutoExitConfigsQuery,
} from '@/types/gqlTypes';
import { evictAutoExitConfigs } from '@/utils/cacheUtil';

export interface AutoExitDialogProps extends DialogProps {
  autoExitId?: string;
}

const AutoExitDialog: React.FC<AutoExitDialogProps> = ({
  autoExitId,
  ...props
}) => {
  const { data } = useGetAutoExitConfigsQuery();

  const autoExit = useMemo(
    () => data?.autoExitConfigs?.nodes?.find((aec) => aec.id === autoExitId),
    [data, autoExitId]
  );

  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>{autoExitId ? 'Edit' : 'New'} Auto Exit Config</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          {autoExit ? (
            <StaticForm<
              UpdateAutoExitConfigMutation,
              UpdateAutoExitConfigMutationVariables
            >
              role={StaticFormRole.AutoExitConfig}
              initialValues={autoExit}
              mutationDocument={UpdateAutoExitConfigDocument}
              getVariables={(values) => ({ input: values, id: autoExit.id })}
              getErrors={(data) => data.updateAutoExitConfig?.errors || []}
              onCompleted={(data) => {
                evictAutoExitConfigs();
                if (
                  !data?.updateAutoExitConfig?.errors?.length &&
                  props.onClose
                )
                  props.onClose({}, 'escapeKeyDown');
              }}
            />
          ) : (
            <StaticForm<
              CreateAutoExitConfigMutation,
              CreateAutoExitConfigMutationVariables
            >
              role={StaticFormRole.AutoExitConfig}
              initialValues={{ lengthOfAbsenceDays: 30 }}
              mutationDocument={CreateAutoExitConfigDocument}
              getVariables={(values) => ({ input: values })}
              getErrors={(data) => data.createAutoExitConfig?.errors || []}
              onCompleted={(data) => {
                evictAutoExitConfigs();
                if (
                  !data?.createAutoExitConfig?.errors?.length &&
                  props.onClose
                )
                  props.onClose({}, 'escapeKeyDown');
              }}
            />
          )}
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default AutoExitDialog;
