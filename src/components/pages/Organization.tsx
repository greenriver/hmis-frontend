import AddIcon from '@mui/icons-material/Add';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '../elements/ButtonLink';
import Loading from '../elements/Loading';
import MultilineTypography from '../elements/MultilineTypography';
import TitleCard from '../elements/TitleCard';

import NotFound from './NotFound';

import OrganizationLayout from '@/components/layout/OrganizationLayout';
import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import { OrganizationPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import OrganizationDetails from '@/modules/projects/components/OrganizationDetails';
import OrganizationProjectsTable from '@/modules/projects/components/tables/OrganizationProjectsTable';
import { useOrganizationCrumbs } from '@/modules/projects/hooks/useOrganizationCrumbs';
import { Routes } from '@/routes/routes';
import {
  DeleteOrganizationDocument,
  DeleteOrganizationMutation,
  DeleteOrganizationMutationVariables,
  PickListType,
} from '@/types/gqlTypes';
import { evictPickList, evictQuery } from '@/utils/cacheUtil';
import generateSafePath from '@/utils/generateSafePath';

const Organization = () => {
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };
  const [canCreateProject] = useHasRootPermissions(['canEditProjectDetails']);

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs();

  const navigate = useNavigate();

  const onSuccessfulDelete = useCallback(() => {
    evictPickList(PickListType.Project);
    evictQuery('organizations');
    navigate(generateSafePath(Routes.ALL_PROJECTS));
  }, [navigate]);

  if (!loading && (!crumbs || !organization)) {
    return <NotFound />;
  }

  const hasDetails = organization && organization?.description;

  return (
    <OrganizationLayout crumbs={crumbs}>
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
              <OrganizationProjectsTable organizationId={organizationId} />
            </TitleCard>
          )}
        </Grid>
        <Grid item xs>
          {(canCreateProject || !!organization?.contactInformation) && (
            <Paper sx={{ p: 2, mb: 2 }}>
              {organization?.contactInformation && (
                <Stack spacing={1} sx={{ mb: 4 }} data-testid='contactInfo'>
                  <Typography variant='h6'>Contact</Typography>
                  <MultilineTypography variant='body2'>
                    {organization?.contactInformation}
                  </MultilineTypography>
                </Stack>
              )}
              {canCreateProject && (
                <Stack spacing={1}>
                  <Typography variant='h6'>Add to Organization</Typography>
                  <ButtonLink
                    data-testid='addProjectButton'
                    to={generateSafePath(Routes.CREATE_PROJECT, {
                      organizationId,
                    })}
                    Icon={AddIcon}
                    leftAlign
                  >
                    Add Project
                  </ButtonLink>
                </Stack>
              )}
            </Paper>
          )}
          <OrganizationPermissionsFilter
            id={organizationId}
            permissions={['canDeleteOrganization', 'canEditOrganization']}
          >
            <Paper sx={{ p: 2, mb: 2 }}>
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
                  <DeleteMutationButton<
                    DeleteOrganizationMutation,
                    DeleteOrganizationMutationVariables
                  >
                    queryDocument={DeleteOrganizationDocument}
                    variables={{ input: { id: organizationId } }}
                    idPath='deleteOrganization.organization.id'
                    recordName='Organization'
                    onSuccess={onSuccessfulDelete}
                    ButtonProps={{
                      variant: 'text',
                      sx: { justifyContent: 'left' },
                    }}
                  >
                    Delete Organization
                  </DeleteMutationButton>
                </OrganizationPermissionsFilter>
              </Stack>
            </Paper>
          </OrganizationPermissionsFilter>
          {organization && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <IdDisplay
                prefix='Organization'
                color='text.secondary'
                value={organization.hudId}
                shortenUuid
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    </OrganizationLayout>
  );
};
export default Organization;
