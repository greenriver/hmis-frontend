import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';

import { MAPPING_KEY, ORGANIZATION_FORM } from './EditOrganization';

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
      console.log(data);
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
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        Create a new Organization
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          <EditRecord<
            OrganizationAllFieldsFragment,
            CreateOrganizationMutation,
            CreateOrganizationMutationVariables
          >
            formDefinition={ORGANIZATION_FORM}
            mappingKey={MAPPING_KEY}
            queryDocument={CreateOrganizationDocument}
            onCompleted={onCompleted}
            getErrors={(data: CreateOrganizationMutation) =>
              data?.createOrganization?.errors
            }
          />
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default CreateOrganization;
