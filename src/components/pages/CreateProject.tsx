import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  CreateProjectDocument,
  CreateProjectMutation,
  CreateProjectMutationVariables,
  FormRole,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const CreateProject = () => {
  const navigate = useNavigate();
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };
  const { crumbs, organizationName } = useOrganizationCrumbs('Add Project');

  const onCompleted = useCallback(
    (data: CreateProjectMutation) => {
      const id = data?.createProject?.project?.id;
      if (id) {
        cache.evict({
          id: `Organization:${organizationId}`,
          fieldName: 'projects',
        });
        navigate(generateSafePath(Routes.PROJECT, { projectId: id }));
      }
    },
    [navigate, organizationId]
  );

  if (!crumbs) throw Error('Organization not found');

  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<
        ProjectAllFieldsFragment,
        CreateProjectMutation,
        CreateProjectMutationVariables
      >
        formRole={FormRole.Project}
        queryDocument={CreateProjectDocument}
        onCompleted={onCompleted}
        inputVariables={{ organizationId }}
        getErrors={(data: CreateProjectMutation) => data?.createProject?.errors}
        FormActionProps={{ submitButtonText: 'Create Project' }}
        title={
          <Typography variant='h3' sx={{ pt: 0, mt: 0, pb: 4 }}>
            Add a new Project to {organizationName}
          </Typography>
        }
      />
    </ProjectLayout>
  );
};
export default CreateProject;
