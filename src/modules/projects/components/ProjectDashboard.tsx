import { Container, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import { ClickToCopyId } from '@/components/elements/ClickToCopyId';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import ContextHeaderContent from '@/components/layout/dashboard/contextHeader/ContextHeaderContent';
import {
  useDashboardBreadcrumbs,
  useProjectBreadcrumbConfig,
} from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';
import DashboardContentContainer from '@/components/layout/dashboard/DashboardContentContainer';
import SideNavMenu from '@/components/layout/dashboard/sideNav/SideNavMenu';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import NotFound from '@/components/pages/NotFound';
import { useDashboardState } from '@/hooks/useDashboardState';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ProjectDashboardRoutes, Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { ProjectAllFieldsFragment, useGetProjectQuery } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectNavHeader = ({
  project,
}: {
  project: ProjectAllFieldsFragment;
}) => {
  return (
    <>
      <Typography variant='h4' sx={{ mb: 2 }}>
        {project.projectName}
      </Typography>
      <Stack gap={2}>
        <CommonLabeledTextBlock title='Project Type'>
          <HmisEnum
            value={project.projectType}
            enumMap={HmisEnums.ProjectType}
          />
        </CommonLabeledTextBlock>
        <CommonLabeledTextBlock title='Organization'>
          <RouterLink
            data-testid='organizationLink'
            to={generateSafePath(Routes.ORGANIZATION, {
              organizationId: project.organization.id,
            })}
          >
            {project.organization.organizationName}
          </RouterLink>
        </CommonLabeledTextBlock>
        <Stack>
          <CommonLabeledTextBlock title='Project ID' horizontal>
            <ClickToCopyId value={project.hudId} />
          </CommonLabeledTextBlock>
          <CommonLabeledTextBlock title='Organization ID' horizontal>
            <ClickToCopyId value={project.organization.hudId} />
          </CommonLabeledTextBlock>
        </Stack>
      </Stack>
    </>
  );
};

const ProjectDashboard: React.FC = () => {
  const params = useSafeParams() as { projectId: string };
  const { globalFeatureFlags } = useHmisAppSettings();
  const {
    data: { project } = {},
    loading,
    error,
  } = useGetProjectQuery({
    variables: { id: params.projectId },
  });

  const isPrint = useIsPrintView();

  if (error) throw error;

  const navItems: NavItem[] = useMemo(() => {
    if (!project) return [];
    return [
      {
        id: 'project-nav',
        // title: 'Project Navigation',
        type: 'category',
        items: [
          {
            id: 'overview',
            title: 'Overview',
            path: generateSafePath(ProjectDashboardRoutes.OVERVIEW, params),
          },

          {
            id: 'enrollments',
            title: 'Enrollments',
            path: generateSafePath(
              ProjectDashboardRoutes.PROJECT_ENROLLMENTS,
              params
            ),
          },
          ...(globalFeatureFlags?.externalReferrals
            ? [
                {
                  id: 'referals',
                  title: 'Referrals',
                  path: generateSafePath(
                    ProjectDashboardRoutes.REFERRALS,
                    params
                  ),
                },
              ]
            : []),
        ],
      },
      {
        id: 'setup',
        title: 'Configuration',
        type: 'category',
        items: [
          {
            id: 'units',
            title: 'Units',
            path: generateSafePath(ProjectDashboardRoutes.UNITS, params),
          },
          {
            id: 'inventory',
            title: 'Inventory',
            path: generateSafePath(ProjectDashboardRoutes.INVENTORY, params),
          },
          {
            id: 'funders',
            title: 'Funders',
            path: generateSafePath(ProjectDashboardRoutes.FUNDERS, params),
          },
          {
            id: 'cocs',
            title: 'CoCs',
            path: generateSafePath(ProjectDashboardRoutes.COCS, params),
          },
        ],
      },
    ];
  }, [project, params, globalFeatureFlags]);

  const dashboardState = useDashboardState();

  const outletContext: ProjectDashboardContext | undefined = useMemo(
    () => (project ? { project } : undefined),
    [project]
  );

  const breadCrumbConfig = useProjectBreadcrumbConfig(outletContext);
  const breadcrumbs = useDashboardBreadcrumbs(breadCrumbConfig);

  if ((loading && !project) || !navItems) return <Loading />;
  if (!project || !outletContext) return <NotFound />;

  if (isPrint) {
    return (
      <>
        <Outlet context={outletContext} />
      </>
    );
  }

  return (
    <DashboardContentContainer
      navHeader={<ProjectNavHeader project={project} />}
      // TODO add back to standardize headers
      // header={header}
      sidebar={<SideNavMenu items={navItems} />}
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      {...dashboardState}
    >
      <Container maxWidth='xl' sx={{ pb: 6 }}>
        <Outlet context={outletContext} />
      </Container>
    </DashboardContentContainer>
  );
};

export type ProjectDashboardContext = { project: ProjectAllFieldsFragment };
export const useProjectDashboardContext = () =>
  useOutletContext<ProjectDashboardContext>();

export default ProjectDashboard;
