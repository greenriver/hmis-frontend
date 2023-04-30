import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import NotFound from './NotFound';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import EditRecord from '@/modules/form/components/EditRecord';
import { useOrganizationCrumbs } from '@/modules/projects/hooks/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import { FormRole, OrganizationFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EditOrganization = () => {
  const navigate = useNavigate();

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs('Edit Organization');

  const onCompleted = useCallback(
    (data: OrganizationFieldsFragment) => {
      navigate(
        generateSafePath(Routes.ORGANIZATION, { organizationId: data.id })
      );
    },
    [navigate]
  );

  if (loading) return <Loading />;
  if (!crumbs || !organization) return <NotFound />;
  if (!organization.access.canEditOrganization) return <NotFound />;

  return (
    <OrganizationLayout crumbs={crumbs}>
      {loading && <Loading />}
      {organization && (
        <EditRecord<OrganizationFieldsFragment>
          formRole={FormRole.Organization}
          record={organization}
          onCompleted={onCompleted}
          title={<Typography variant='h3'>Edit {organizationName}</Typography>}
        />
      )}
    </OrganizationLayout>
  );
};
export default EditOrganization;
