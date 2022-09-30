import {
  Button,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback } from 'react';
import {
  generatePath,
  Link as RouterLink,
  useNavigate,
  useParams,
} from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import GenericTable, { ColumnDef } from '../elements/GenericTable';
import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import OrganizationDetails from '@/modules/inventory/components/OrganizationDetails';
import { ALL_PROJECTS_CRUMB } from '@/modules/inventory/components/useProjectCrumbs';
import apolloClient from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
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

  const columns: ColumnDef<ProjectAllFieldsFragment>[] = [
    {
      header: 'Name',
      render: 'projectName',
    },
    {
      header: 'Type',
      render: (project: ProjectAllFieldsFragment) =>
        project.projectType
          ? HmisEnums.ProjectType[project.projectType]
          : project.continuumProject
          ? 'Continuum Project'
          : null,
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
        <Typography variant='h4'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Typography variant='h3' sx={{ mb: 4 }}>
          {organizationName}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={9}>
            {loading && <Loading />}

            {organization?.description && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <OrganizationDetails organization={organization} />
              </Paper>
            )}

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Projects
              </Typography>
              {(organization?.projects || []).length > 0 ? (
                <GenericTable
                  rows={organization?.projects || []}
                  columns={columns}
                  handleRowClick={handleRowClick}
                  loading={loading}
                />
              ) : (
                <Typography>No Projects</Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Add to Organization</Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Project
                </Button>
              </Stack>
            </Paper>
            {organization?.contactInformation && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Stack spacing={2}>
                  <Typography variant='h6'>Organization Contact</Typography>
                  <Typography variant='body2'>
                    {organization.contactInformation}
                  </Typography>
                </Stack>
              </Paper>
            )}
            <Paper sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Link
                  component={RouterLink}
                  color='text.secondary'
                  to={generatePath(Routes.EDIT_ORGANIZATION, {
                    organizationId,
                  })}
                >
                  Edit Organization
                </Link>
                <Link color='text.secondary' component={RouterLink} to=''>
                  Delete Organization
                </Link>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default Organization;
