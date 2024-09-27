import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Stack } from '@mui/material';

import ButtonLink from '../elements/ButtonLink';
import Loading from '../elements/Loading';
import TitleCard from '../elements/TitleCard';
import PageTitle from '../layout/PageTitle';

import NotFound from './NotFound';

import { Routes } from '@/app/routes';
import BasicBreadcrumbPageLayout from '@/components/layout/BasicBreadcrumbPageLayout';
import useSafeParams from '@/hooks/useSafeParams';
import { OrganizationPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import OrganizationDetails from '@/modules/projects/components/OrganizationDetails';
import OrganizationProjectsTable from '@/modules/projects/components/tables/OrganizationProjectsTable';
import { useOrganizationCrumbs } from '@/modules/projects/hooks/useOrganizationCrumbs';
import { generateSafePath } from '@/utils/pathEncoding';

const Organization = () => {
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };
  const [canCreateProject] = useHasRootPermissions(['canEditProjectDetails']);

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs();

  if (loading && !organization) return <Loading />;
  if (!crumbs || !organization) return <NotFound />;

  return (
    <BasicBreadcrumbPageLayout crumbs={crumbs}>
      <PageTitle
        title={organizationName}
        actions={
          <OrganizationPermissionsFilter
            id={organizationId}
            permissions={['canEditOrganization']}
          >
            <ButtonLink
              data-testid='updateOrganizationButton'
              to={generateSafePath(Routes.EDIT_ORGANIZATION, {
                organizationId,
              })}
              sx={{ justifyContent: 'left' }}
              startIcon={<EditIcon />}
            >
              Edit Organization
            </ButtonLink>
          </OrganizationPermissionsFilter>
        }
      />
      <Stack gap={4}>
        <TitleCard
          title='Organization Details'
          data-testid='organizationDetailsCard'
        >
          <OrganizationDetails organization={organization} />
        </TitleCard>
        <TitleCard
          data-testid='projectsCard'
          title='Projects'
          stackOnMobile={false}
          actions={
            canCreateProject && (
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
            )
          }
        >
          <OrganizationProjectsTable organizationId={organizationId} />
        </TitleCard>
      </Stack>
    </BasicBreadcrumbPageLayout>
  );
};
export default Organization;
