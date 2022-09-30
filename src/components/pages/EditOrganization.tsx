import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';

import EditRecord from '@/modules/form/components/EditRecord';
import formData from '@/modules/form/data/organization.json';
import { FormDefinition } from '@/modules/form/types';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import {
  OrganizationAllFieldsFragment,
  UpdateOrganizationDocument,
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables,
} from '@/types/gqlTypes';

export const MAPPING_KEY = 'organizationMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const ORGANIZATION_FORM: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const EditOrganization = () => {
  const navigate = useNavigate();

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs('Edit');

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
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h3' sx={{ mb: 4 }}>
        Edit {organizationName}
      </Typography>
      <Grid container>
        <Grid item xs={9}>
          {loading && <Loading />}
          {organization && (
            <EditRecord<
              OrganizationAllFieldsFragment,
              UpdateOrganizationMutation,
              UpdateOrganizationMutationVariables
            >
              formDefinition={ORGANIZATION_FORM}
              mappingKey={MAPPING_KEY}
              record={organization}
              queryDocument={UpdateOrganizationDocument}
              onCompleted={onCompleted}
              getErrors={(data: UpdateOrganizationMutation) =>
                data?.updateOrganization?.errors
              }
            />
          )}
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default EditOrganization;
