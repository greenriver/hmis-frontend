import { Container, Grid, Typography } from '@mui/material';
import { useMemo } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/organization.json';
import {
  createInitialValues,
  transformSubmitValues,
} from '@/modules/form/formUtil';
import { FormDefinition } from '@/modules/form/types';
import { ALL_PROJECTS_CRUMB } from '@/modules/inventory/components/useProjectCrumbs';
import apolloClient from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  OrganizationFieldsFragmentDoc,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} from '@/types/gqlTypes';

const MAPPING_KEY = 'organizationMutationInput';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const formDefinition: FormDefinition = JSON.parse(JSON.stringify(formData));

const EditOrganization = () => {
  const { organizationId } = useParams() as {
    organizationId: string;
  };
  const navigate = useNavigate();

  // get org from cache if we have it
  const organizationNameFragment = apolloClient.readFragment({
    id: `Organization:${organizationId}`,
    fragment: OrganizationFieldsFragmentDoc,
  });

  const {
    data: { organization } = {},
    loading,
    error,
  } = useGetOrganizationQuery({ variables: { id: organizationId } });

  if (error) throw error;
  if (!loading && !organization) throw Error('Organization not found');

  const organizationName =
    organizationNameFragment?.organizationName ||
    organization?.organizationName ||
    `Organization ${organizationId}`;

  const crumbs = [
    ALL_PROJECTS_CRUMB,
    {
      label: organizationName,
      to: Routes.ORGANIZATION,
    },

    {
      label: 'Edit',
      to: Routes.EDIT_ORGANIZATION,
    },
  ];

  const [mutateFunction, { loading: saveLoading, error: saveError }] =
    useUpdateOrganizationMutation({
      onCompleted: (data) => {
        if (data?.updateOrganization?.organization?.id) {
          navigate(
            generatePath(Routes.ORGANIZATION, {
              organizationId: data?.updateOrganization?.organization?.id,
            })
          );
        }
      },
    });

  const initialValues = useMemo(() => {
    if (!organization) return;
    return createInitialValues(formDefinition, organization, MAPPING_KEY);
  }, [organization]);

  const submitHandler = (values: Record<string, any>) => {
    // Transform values into client input query variables
    const variables = transformSubmitValues(
      formDefinition,
      values,
      MAPPING_KEY,
      true
    );
    console.log(JSON.stringify(variables, null, 2));

    void mutateFunction({
      variables: {
        input: {
          id: organizationId,
          input: variables,
          clientMutationId: '123',
        },
      },
    });
  };

  if (loading) return <Loading />;
  if (!crumbs || !organization) throw Error('Organization not found');
  if (saveError) throw saveError;

  return (
    <>
      <PageHeader>
        <Typography variant='h4'>Organizations</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Grid container>
          <Grid item xs={9}>
            <DynamicForm
              definition={formDefinition}
              onSubmit={submitHandler}
              submitButtonText='Save Changes'
              discardButtonText='Discard'
              initialValues={initialValues}
              loading={saveLoading}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default EditOrganization;
