import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import ButtonLink from '../elements/ButtonLink';
import ConfirmationDialog from '../elements/ConfirmDialog';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';

import OrganizationDetails from '@/modules/inventory/components/OrganizationDetails';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import ProjectsTable from '@/modules/inventory/components/ProjectsTable';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import { useDeleteOrganizationMutation } from '@/types/gqlTypes';

const Organization = () => {
  const { organizationId } = useParams() as {
    organizationId: string;
  };

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs();

  if (!loading && (!crumbs || !organization))
    throw Error('Organization not found');

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteOrganization, { loading: deleteLoading, error: deleteError }] =
    useDeleteOrganizationMutation({
      variables: { input: { id: organizationId } },
      onCompleted: () => navigate(generatePath(Routes.ALL_PROJECTS)),
    });
  if (deleteError) console.error(deleteError);

  // const projects = useMemo(
  //   () =>
  //     sortBy(organization?.projects || [], [
  //       (p) => !!p.operatingEndDate,
  //       'operatingStartDate',
  //       'operatingEndDate',
  //       'projectName',
  //     ]),
  //   [organization]
  // );

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
              <Typography variant='h5' sx={{ mb: 2 }}>
                Organization Details
              </Typography>
              <OrganizationDetails organization={organization} />
            </Paper>
          )}

          {organization && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Projects
              </Typography>
              <ProjectsTable organizationId={organizationId} />
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
            <Stack>
              <ButtonLink
                variant='text'
                color='secondary'
                to={generatePath(Routes.EDIT_ORGANIZATION, {
                  organizationId,
                })}
                sx={{ justifyContent: 'left' }}
              >
                Edit Organization
              </ButtonLink>
              <Button
                color='error'
                variant='text'
                onClick={() => setOpen(true)}
                sx={{ justifyContent: 'left' }}
              >
                Delete organization
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <ConfirmationDialog
        id='deleteOrgConfirmation'
        open={open}
        title='Delete organization'
        onConfirm={deleteOrganization}
        onCancel={() => setOpen(false)}
        loading={deleteLoading}
      >
        <Typography>
          Are you sure you want to delete organization{' '}
          <strong>{organization?.organizationName}</strong>?
        </Typography>
        <Typography>This action cannot be undone.</Typography>
      </ConfirmationDialog>
    </ProjectLayout>
  );
};
export default Organization;
