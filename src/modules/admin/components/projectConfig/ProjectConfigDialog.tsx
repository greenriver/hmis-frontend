import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import React from 'react';

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
  config?: ProjectConfigFieldsFragment;
}

const ProjectConfigDialog: React.FC<ProjectDialogProps> = ({
  config,
  ...props
}) => {
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
              initialValues={config}
              mutationDocument={UpdateProjectConfigDocument}
              getVariables={(values) => ({
                input: values as ProjectConfigInput,
                id: config.id,
              })}
              getErrors={(data) => data.updateProjectConfig?.errors || []}
              onCompleted={(data) => {
                evictProjectConfigs();
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
