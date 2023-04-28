import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import NotFound from './NotFound';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { useOrganizationCrumbs } from '@/modules/projects/hooks/useOrganizationCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { FormRole, ProjectAllFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const CreateProject = () => {
  const navigate = useNavigate();
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };
  const { crumbs, organizationName } = useOrganizationCrumbs('Add Project');

  const onCompleted = useCallback(
    (createdProject: ProjectAllFieldsFragment) => {
      cache.evict({
        id: `Organization:${organizationId}`,
        fieldName: 'projects',
      });
      navigate(
        generateSafePath(Routes.PROJECT, { projectId: createdProject.id })
      );
    },
    [navigate, organizationId]
  );

  if (!crumbs) return <NotFound />;

  return (
    <OrganizationLayout crumbs={crumbs}>
      <EditRecord<ProjectAllFieldsFragment>
        formRole={FormRole.Project}
        onCompleted={onCompleted}
        inputVariables={{ organizationId }}
        FormActionProps={{ submitButtonText: 'Create Project' }}
        title={
          <Typography variant='h3' sx={{ pt: 0, mt: 0, pb: 4 }}>
            Add a new Project to {organizationName}
          </Typography>
        }
      />
    </OrganizationLayout>
  );
};
export default CreateProject;
