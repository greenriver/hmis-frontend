import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import React, { useMemo } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import StaticForm from '@/modules/form/components/StaticForm';
import {
  CreateProjectConfigDocument,
  CreateProjectConfigMutation,
  CreateProjectConfigMutationVariables,
  ProjectConfigFieldsFragment,
  ProjectConfigInput,
  StaticFormRole,
  UpdateProjectConfigDocument,
  UpdateProjectConfigMutation,
  UpdateProjectConfigMutationVariables,
} from '@/types/gqlTypes';
import { evictProjectConfigs } from '@/utils/cacheUtil';

export interface ProjectDialogProps extends DialogProps {
  config?: ProjectConfigFieldsFragment | null;
}

const ProjectConfigDialog: React.FC<ProjectDialogProps> = ({
  config,
  ...props
}) => {
  const configOptions = useMemo(() => {
    if (!config || !config.configOptions) return {};
    return JSON.parse(config.configOptions);
  }, [config]);

  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>{config ? 'Edit' : 'New'} Project Config</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          {config ? (
            <StaticForm<
              UpdateProjectConfigMutation,
              UpdateProjectConfigMutationVariables
            >
              role={StaticFormRole.ProjectConfig}
              initialValues={{
                lengthOfAbsenceDays: configOptions.length_of_absence_days,
                receivesDirectReferrals:
                  configOptions.receives_direct_referrals,
                supportsWaitlistReferrals:
                  configOptions.supports_waitlist_referrals,
                ...config,
              }}
              mutationDocument={UpdateProjectConfigDocument}
              getVariables={(values) => ({
                input: values as ProjectConfigInput,
                id: config.id,
              })}
              getErrors={(data) => data.updateProjectConfig?.errors || []}
              onCompleted={(data) => {
                if (!data?.updateProjectConfig?.errors?.length && props.onClose)
                  props.onClose({}, 'escapeKeyDown');
              }}
              DynamicFormProps={{
                FormActionProps: {
                  onDiscard: () => {
                    if (props.onClose) props.onClose({}, 'escapeKeyDown');
                  },
                },
              }}
            />
          ) : (
            <StaticForm<
              CreateProjectConfigMutation,
              CreateProjectConfigMutationVariables
            >
              role={StaticFormRole.ProjectConfig}
              mutationDocument={CreateProjectConfigDocument}
              getVariables={(values) => ({
                input: values as ProjectConfigInput,
              })}
              getErrors={(data) => data.createProjectConfig?.errors || []}
              onCompleted={(data) => {
                evictProjectConfigs();
                if (!data?.createProjectConfig?.errors?.length && props.onClose)
                  props.onClose({}, 'escapeKeyDown');
              }}
              DynamicFormProps={{
                FormActionProps: {
                  onDiscard: () => {
                    if (props.onClose) props.onClose({}, 'escapeKeyDown');
                  },
                },
              }}
            />
          )}
        </Box>
      </DialogContent>
    </CommonDialog>
  );
};

export default ProjectConfigDialog;
