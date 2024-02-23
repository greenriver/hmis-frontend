import { Box, DialogContent, DialogProps, DialogTitle } from '@mui/material';
import React, { useMemo } from 'react';

import CommonDialog from '@/components/elements/CommonDialog';
import StaticForm from '@/modules/form/components/StaticForm';
import {
  CreateProjectConfigDocument,
  CreateProjectConfigMutation,
  CreateProjectConfigMutationVariables,
  ProjectConfigInput,
  StaticFormRole,
  UpdateProjectConfigDocument,
  UpdateProjectConfigMutation,
  UpdateProjectConfigMutationVariables,
  useGetProjectConfigsQuery,
} from '@/types/gqlTypes';
import { evictProjectConfigs } from '@/utils/cacheUtil';

export interface ProjectDialogProps extends DialogProps {
  projectId?: string;
}

const ProjectConfigDialog: React.FC<ProjectDialogProps> = ({
  projectId,
  ...props
}) => {
  const { data } = useGetProjectConfigsQuery();

  const project = useMemo(
    () => data?.projectConfigs?.nodes?.find((aec) => aec.id === projectId),
    [data, projectId]
  );

  return (
    <CommonDialog maxWidth='sm' fullWidth {...props}>
      <DialogTitle>{projectId ? 'Edit' : 'New'} Project Config</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          {project ? (
            <StaticForm<
              UpdateProjectConfigMutation,
              UpdateProjectConfigMutationVariables
            >
              role={StaticFormRole.ProjectConfig}
              initialValues={project}
              mutationDocument={UpdateProjectConfigDocument}
              getVariables={(values) => ({
                input: values as ProjectConfigInput,
                id: project.id,
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
