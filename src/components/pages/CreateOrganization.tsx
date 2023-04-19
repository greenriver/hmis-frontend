import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import NotFound from './NotFound';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { ALL_PROJECTS_CRUMB } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  FormRole,
  OrganizationAllFieldsFragment,
  PickListType,
} from '@/types/gqlTypes';
import { evictPickList, evictQuery } from '@/utils/cacheUtil';
import generateSafePath from '@/utils/generateSafePath';

const CreateOrganization = () => {
  const navigate = useNavigate();

  const crumbs = [
    ALL_PROJECTS_CRUMB,
    {
      label: 'Add Organization',
      to: Routes.CREATE_ORGANIZATION,
    },
  ];

  const onCompleted = useCallback(
    (data: OrganizationAllFieldsFragment) => {
      evictPickList(PickListType.Project);
      evictQuery('organizations');
      navigate(
        generateSafePath(Routes.ORGANIZATION, { organizationId: data.id })
      );
    },
    [navigate]
  );

  if (!crumbs) return <NotFound />;

  return (
    <ProjectLayout crumbs={crumbs}>
      <EditRecord<OrganizationAllFieldsFragment>
        formRole={FormRole.Organization}
        onCompleted={onCompleted}
        FormActionProps={{ submitButtonText: 'Create Organization' }}
        title={<Typography variant='h3'>Create a new organization</Typography>}
      />
    </ProjectLayout>
  );
};
export default CreateOrganization;
