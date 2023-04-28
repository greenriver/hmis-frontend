import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import EditRecord from '@/modules/form/components/EditRecord';
import OrganizationLayout from '@/modules/inventory/components/OrganizationLayout';
import { ALL_PROJECTS_CRUMB } from '@/modules/inventory/components/useOrganizationCrumbs';
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

  return (
    <OrganizationLayout crumbs={crumbs}>
      <EditRecord<OrganizationAllFieldsFragment>
        formRole={FormRole.Organization}
        onCompleted={onCompleted}
        FormActionProps={{ submitButtonText: 'Create Organization' }}
        title={
          <Typography variant='h3' sx={{ mt: 2 }}>
            Create a new organization
          </Typography>
        }
      />
    </OrganizationLayout>
  );
};
export default CreateOrganization;
