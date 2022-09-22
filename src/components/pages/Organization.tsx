import { Container, Grid, Paper, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import GenericTable from '../elements/GenericTable';
import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { ALL_PROJECTS_CRUMB } from '@/modules/inventory/components/useProjectCrumbs';
import apolloClient from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { ProjectTypeEnum } from '@/types/gqlEnums';
import {
  OrganizationFieldsFragmentDoc,
  ProjectAllFieldsFragment,
  useGetOrganizationQuery,
} from '@/types/gqlTypes';

const Organization = () => {
  const { organizationId } = useParams() as {
    organizationId: string;
  };
  const navigate = useNavigate();

  // get org from cache if we have it
  const organizationNameFragment = apolloClient.readFragment({
    id: `Organization:${organizationId}`,
    fragment: OrganizationFieldsFragmentDoc,
  });
  console.log('fragment', organizationId, organizationNameFragment);

  const {
    data: { organization } = {},
    loading,
    error,
  } = useGetOrganizationQuery({ variables: { id: organizationId } });

  const handleRowClick = useCallback(
    (project: ProjectAllFieldsFragment) =>
      navigate(
        generatePath(Routes.PROJECT, {
          projectId: project.id,
        })
      ),
    [navigate]
  );

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
  ];

  const columns = [
    {
      header: 'Name',
      render: 'projectName',
    },
    {
      header: 'Type',
      render: (project: ProjectAllFieldsFragment) =>
        project.projectType
          ? ProjectTypeEnum[project.projectType]
          : project.continuumProject && 'Continuum Project',
    },
    {
      header: 'Start Date',
      render: (project: ProjectAllFieldsFragment) =>
        project.operatingStartDate &&
        HmisUtil.parseAndFormatDate(project.operatingStartDate),
    },
    {
      header: 'End Date',
      render: (project: ProjectAllFieldsFragment) =>
        project.operatingEndDate &&
        HmisUtil.parseAndFormatDate(project.operatingEndDate),
    },
  ];

  return (
    <>
      <PageHeader>
        <Typography variant='h5'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Typography variant='h3' sx={{ mb: 2 }}>
          {organizationName}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={9}>
            {loading && <Loading />}

            {!loading &&
              organization &&
              (organization.description || organization.contactInformation) && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 'bold' }}
                      >
                        Description
                      </Typography>
                      <Typography variant='subtitle2'>
                        {organization.description || 'No description provided.'}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        variant='subtitle2'
                        sx={{ fontWeight: 'bold' }}
                      >
                        Contact Information
                      </Typography>
                      <Typography variant='subtitle2'>
                        {organization.contactInformation ||
                          'No contact information provided.'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Projects
              </Typography>
              <GenericTable
                rows={organization?.projects || []}
                columns={columns}
                handleRowClick={handleRowClick}
                loading={loading}
              />
            </Paper>
          </Grid>
          <Grid item xs></Grid>
        </Grid>
      </Container>
    </>
  );
};
export default Organization;
