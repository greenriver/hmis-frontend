import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import NotFound from '../../../components/pages/NotFound';

import BasicBreadcrumbPageLayout from '@/components/layout/BasicBreadcrumbPageLayout';
import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { useOrganizationCrumbs } from '@/modules/projects/hooks/useOrganizationCrumbs';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { RecordFormRole, ProjectAllFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const CreateProjectPage = () => {
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
    <BasicBreadcrumbPageLayout crumbs={crumbs}>
      <EditRecord<ProjectAllFieldsFragment>
        formRole={RecordFormRole.Project}
        onCompleted={onCompleted}
        inputVariables={{ organizationId }}
        FormActionProps={{ submitButtonText: 'Create Project' }}
        title={
          <Typography variant='h3' sx={{ mt: 1, mb: 3 }}>
            Add a new Project to {organizationName}
          </Typography>
        }
      />
    </BasicBreadcrumbPageLayout>
  );
};
export default CreateProjectPage;
