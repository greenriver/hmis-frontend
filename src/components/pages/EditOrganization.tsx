import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import {
  OrganizationAllFieldsFragment,
  UpdateOrganizationDocument,
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EditOrganization = () => {
  const navigate = useNavigate();

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs('Edit Organization');

  const onCompleted = useCallback(
    (data: UpdateOrganizationMutation) => {
      const id = data?.updateOrganization?.organization?.id;
      if (id) {
        navigate(generateSafePath(Routes.ORGANIZATION, { organizationId: id }));
      }
    },
    [navigate]
  );

  if (loading) return <Loading />;
  if (!crumbs || !organization) throw Error('Organization not found');

  return (
    <ProjectLayout crumbs={crumbs}>
      {loading && <Loading />}
      {organization && (
        <EditRecord<
          OrganizationAllFieldsFragment,
          UpdateOrganizationMutation,
          UpdateOrganizationMutationVariables
        >
          definitionIdentifier='organization'
          record={organization}
          queryDocument={UpdateOrganizationDocument}
          onCompleted={onCompleted}
          getErrors={(data: UpdateOrganizationMutation) =>
            data?.updateOrganization?.errors
          }
          title={<Typography variant='h3'>Edit {organizationName}</Typography>}
        />
      )}
    </ProjectLayout>
  );
};
export default EditOrganization;
