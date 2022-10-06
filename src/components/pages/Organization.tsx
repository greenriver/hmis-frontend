import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import ButtonLink from '../elements/ButtonLink';
import GenericTable, { ColumnDef } from '../elements/GenericTable';
import Loading from '../elements/Loading';
import RouterLink from '../elements/RouterLink';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import OrganizationDetails from '@/modules/inventory/components/OrganizationDetails';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { ProjectAllFieldsFragment } from '@/types/gqlTypes';

const Organization = () => {
  const { organizationId } = useParams() as {
    organizationId: string;
  };
  const navigate = useNavigate();

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs();

  const handleRowClick = useCallback(
    (project: ProjectAllFieldsFragment) =>
      navigate(
        generatePath(Routes.PROJECT, {
          projectId: project.id,
        })
      ),
    [navigate]
  );

  if (!loading && (!crumbs || !organization))
    throw Error('Organization not found');

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

  const hasDetails = organization && organization?.description;

  return (
    <ProjectLayout>
      {crumbs && <Breadcrumbs crumbs={crumbs} />}

      <Typography variant='h3' sx={{ mb: 4 }}>
        {organizationName}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={9}>
          {loading && <Loading />}

          {hasDetails && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Organization Details
              </Typography>
              <OrganizationDetails organization={organization} />
            </Paper>
          )}

          {organization && (
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
          )}
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2, mb: 2 }}>
            {organization?.contactInformation && (
              <Stack spacing={1} sx={{ mb: 4 }}>
                <Typography variant='h6'>Contact</Typography>
                <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
                  {organization?.contactInformation}
                </Typography>
              </Stack>
            )}
            <Stack spacing={1}>
              <Typography variant='h6'>Add to Organization</Typography>
              <ButtonLink
                variant='outlined'
                color='secondary'
                sx={{ pl: 3, justifyContent: 'left' }}
                to={generatePath(Routes.CREATE_PROJECT, { organizationId })}
              >
                + Add Project
              </ButtonLink>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Stack spacing={1}>
              <RouterLink
                color='text.secondary'
                to={generatePath(Routes.EDIT_ORGANIZATION, {
                  organizationId,
                })}
              >
                Edit Organization
              </RouterLink>
              <RouterLink color='text.secondary' to=''>
                Delete Organization
              </RouterLink>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </ProjectLayout>
  );
};
export default Organization;
