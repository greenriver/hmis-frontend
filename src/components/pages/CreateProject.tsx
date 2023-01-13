import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  CreateProjectDocument,
  CreateProjectMutation,
  CreateProjectMutationVariables,
  ProjectAllFieldsFragment,
} from '@/types/gqlTypes';

const CreateProject = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams() as {
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
        navigate(generatePath(Routes.PROJECT, { projectId: id }));
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
        definitionIdentifier='project'
        queryDocument={CreateProjectDocument}
        onCompleted={onCompleted}
        inputVariables={{ organizationId }}
        getErrors={(data: CreateProjectMutation) => data?.createProject?.errors}
        submitButtonText='Create Project'
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
