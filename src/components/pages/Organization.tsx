import { Grid, Paper, Stack, Typography } from '@mui/material';
import { sortBy } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { generatePath, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import ButtonLink from '../elements/ButtonLink';
import GenericTable, { ColumnDef } from '../elements/GenericTable';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';
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

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs();

  const rowLinkTo = useCallback(
    (project: ProjectAllFieldsFragment) =>
      generatePath(Routes.PROJECT, {
        projectId: project.id,
      }),
    []
  );

  if (!loading && (!crumbs || !organization))
    throw Error('Organization not found');

  const projects = useMemo(
    () =>
      sortBy(organization?.projects || [], [
        (p) => !!p.operatingEndDate,
        'operatingStartDate',
        'operatingEndDate',
        'projectName',
      ]),
    [organization]
  );

  const columns: ColumnDef<ProjectAllFieldsFragment>[] = [
    {
      header: 'Name',
      render: 'projectName',
      linkTreatment: true,
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
        (project.operatingEndDate &&
          HmisUtil.parseAndFormatDate(project.operatingEndDate)) ||
        'Active',
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
              {projects.length > 0 ? (
                <GenericTable
                  rows={projects}
                  columns={columns}
                  rowLinkTo={rowLinkTo}
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
                <MultilineTypography variant='body2'>
                  {organization?.contactInformation}
                </MultilineTypography>
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
