import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
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

const EditOrganization = () => {
  const navigate = useNavigate();

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs('Update Organization');

  const onCompleted = useCallback(
    (data: UpdateOrganizationMutation) => {
      const id = data?.updateOrganization?.organization?.id;
      if (id) {
        navigate(generatePath(Routes.ORGANIZATION, { organizationId: id }));
      }
    },
    [navigate]
  );

  if (loading) return <Loading />;
  if (!crumbs || !organization) throw Error('Organization not found');

  return (
    <ProjectLayout>
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
          submitButtonText='Update Organization'
          title={
            <>
              <Breadcrumbs crumbs={crumbs} />
              <Typography variant='h3'>Update {organizationName}</Typography>
            </>
          }
        />
      )}
    </ProjectLayout>
  );
};
export default EditOrganization;
