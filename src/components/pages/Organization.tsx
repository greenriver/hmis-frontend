import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '../elements/ButtonLink';
import ConfirmationDialog from '../elements/ConfirmationDialog';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';
import TitleCard from '../elements/TitleCard';

import NotFound from './404';

import useSafeParams from '@/hooks/useSafeParams';
import OrganizationDetails from '@/modules/inventory/components/OrganizationDetails';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import ProjectsTable from '@/modules/inventory/components/ProjectsTable';
import { useOrganizationCrumbs } from '@/modules/inventory/components/useOrganizationCrumbs';
import { OrganizationPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { Routes } from '@/routes/routes';
import { PickListType, useDeleteOrganizationMutation } from '@/types/gqlTypes';
import { evictPickList, evictQuery } from '@/utils/cacheUtil';
import generateSafePath from '@/utils/generateSafePath';

const Organization = () => {
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteOrganization, { loading: deleteLoading, error: deleteError }] =
    useDeleteOrganizationMutation({
      variables: { input: { id: organizationId } },
      onCompleted: () => {
        evictPickList(PickListType.Project);
        evictQuery('organizations');
        navigate(generateSafePath(Routes.ALL_PROJECTS));
      },
    });

  if (!loading && (!crumbs || !organization)) {
    return <NotFound />;
  }
  if (deleteError) console.error(deleteError);

  const hasDetails = organization && organization?.description;

  return (
    <ProjectLayout crumbs={crumbs}>
      <Typography variant='h3' sx={{ mb: 4 }}>
        {organizationName}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={9}>
          {loading && <Loading />}

          {hasDetails && (
            <Paper sx={{ p: 2, mb: 2 }} data-testid='organizationDetailsCard'>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Organization Details
              </Typography>
              <OrganizationDetails organization={organization} />
            </Paper>
          )}

          {organization && (
            <TitleCard data-testid='projectsCard' title='Projects'>
              <ProjectsTable organizationId={organizationId} />
            </TitleCard>
          )}
        </Grid>
        <Grid item xs>
          <Paper sx={{ p: 2, mb: 2 }}>
            {organization?.contactInformation && (
              <Stack spacing={1} sx={{ mb: 4 }} data-testid='contactInfo'>
                <Typography variant='h6'>Contact</Typography>
                <MultilineTypography variant='body2'>
                  {organization?.contactInformation}
                </MultilineTypography>
              </Stack>
            )}
            <Stack spacing={1}>
              <Typography variant='h6'>Add to Organization</Typography>
              <ButtonLink
                data-testid='addProjectButton'
                to={generateSafePath(Routes.CREATE_PROJECT, { organizationId })}
                Icon={AddIcon}
                leftAlign
              >
                Add Project
              </ButtonLink>
            </Stack>
          </Paper>

          <OrganizationPermissionsFilter
            id={organizationId}
            permissions={['canDeleteOrganization', 'canEditOrganization']}
          >
            <Paper sx={{ p: 2 }}>
              <Stack>
                <OrganizationPermissionsFilter
                  id={organizationId}
                  permissions={['canEditOrganization']}
                >
                  <ButtonLink
                    data-testid='updateOrganizationButton'
                    variant='text'
                    color='secondary'
                    to={generateSafePath(Routes.EDIT_ORGANIZATION, {
                      organizationId,
                    })}
                    sx={{ justifyContent: 'left' }}
                  >
                    Edit Organization
                  </ButtonLink>
                </OrganizationPermissionsFilter>
                <OrganizationPermissionsFilter
                  id={organizationId}
                  permissions={['canDeleteOrganization']}
                >
                  <Button
                    data-testid='deleteOrganizationButton'
                    color='error'
                    variant='text'
                    onClick={() => setOpen(true)}
                    sx={{ justifyContent: 'left' }}
                  >
                    Delete Organization
                  </Button>
                </OrganizationPermissionsFilter>
              </Stack>
            </Paper>
          </OrganizationPermissionsFilter>
        </Grid>
      </Grid>
      <ConfirmationDialog
        id='deleteOrgConfirmation'
        open={open}
        title='Delete organization'
        onConfirm={() => deleteOrganization()}
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
