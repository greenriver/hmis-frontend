import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLocalConstantsForProjectForm } from '../hooks/useLocalConstantsForProjectForm';
import { useOrganizationCrumbs } from '../hooks/useOrganizationCrumbs';
import Loading from '@/components/elements/Loading';
import BasicBreadcrumbPageLayout from '@/components/layout/BasicBreadcrumbPageLayout';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { ProjectAllFieldsFragment, RecordFormRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };
  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs('Add Project');

  const canCreateProject = organization?.access.canCreateProjects;

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

  const localConstants = useLocalConstantsForProjectForm();

  if (loading && !organization) return <Loading />;
  if (!crumbs) return <NotFound />;
  if (!canCreateProject) return <NotFound />;

  return (
    <BasicBreadcrumbPageLayout crumbs={crumbs}>
      <EditRecord<ProjectAllFieldsFragment>
        formRole={RecordFormRole.Project}
        onCompleted={onCompleted}
        inputVariables={{ organizationId }}
        localConstants={localConstants}
        FormActionProps={{ submitButtonText: 'Create Project' }}
        title={
          <Typography component='h1' variant='h3' sx={{ mt: 1, mb: 3 }}>
            Add a new Project to {organizationName}
          </Typography>
        }
      />
    </BasicBreadcrumbPageLayout>
  );
};
export default CreateProjectPage;
