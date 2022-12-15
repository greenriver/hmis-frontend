import { Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';

import EditRecord from '@/modules/form/components/EditRecord';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { ALL_PROJECTS_CRUMB } from '@/modules/inventory/components/useProjectCrumbs';
import { Routes } from '@/routes/routes';
import {
  CreateOrganizationDocument,
  CreateOrganizationMutation,
  CreateOrganizationMutationVariables,
  OrganizationAllFieldsFragment,
} from '@/types/gqlTypes';

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
    (data: CreateOrganizationMutation) => {
      const id = data?.createOrganization?.organization?.id;
      if (id) {
        navigate(generatePath(Routes.ORGANIZATION, { organizationId: id }));
      }
    },
    [navigate]
  );

  if (!crumbs) throw Error('Organization not found');

  return (
    <ProjectLayout>
      <EditRecord<
        OrganizationAllFieldsFragment,
        CreateOrganizationMutation,
        CreateOrganizationMutationVariables
      >
        definitionIdentifier='organization'
        queryDocument={CreateOrganizationDocument}
        onCompleted={onCompleted}
        getErrors={(data: CreateOrganizationMutation) =>
          data?.createOrganization?.errors
        }
        submitButtonText='Create Organization'
        title={
          <>
            <Breadcrumbs crumbs={crumbs} />
            <Typography variant='h3'>Create a new organization</Typography>
          </>
        }
      />
    </ProjectLayout>
  );
};
export default CreateOrganization;
