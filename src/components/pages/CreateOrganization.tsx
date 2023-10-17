import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import BasicBreadcrumbPageLayout from '@/components/layout/BasicBreadcrumbPageLayout';
import EditRecord from '@/modules/form/components/EditRecord';
import { ALL_PROJECTS_CRUMB } from '@/modules/projects/hooks/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import {
  FormRole,
  OrganizationFieldsFragment,
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
    (data: OrganizationFieldsFragment) => {
      evictPickList(PickListType.Project);
      // FIXME check
      evictQuery('organizations');
      navigate(
        generateSafePath(Routes.ORGANIZATION, { organizationId: data.id })
      );
    },
    [navigate]
  );

  return (
    <BasicBreadcrumbPageLayout crumbs={crumbs}>
      <EditRecord<OrganizationFieldsFragment>
        formRole={FormRole.Organization}
        onCompleted={onCompleted}
        FormActionProps={{ submitButtonText: 'Create Organization' }}
        title={
          <Typography variant='h3' sx={{ mt: 2, mb: 1 }}>
            Create a new organization
          </Typography>
        }
      />
    </BasicBreadcrumbPageLayout>
  );
};
export default CreateOrganization;
