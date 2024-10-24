import { Container, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import { useDetailedProject } from '../hooks/useDetailedProject';
import { useProjectDashboardNavItems } from '../hooks/useProjectDashboardNavItems';
import { ClickToCopyId } from '@/components/elements/ClickToCopy';
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
import NotFound from '@/components/pages/NotFound';
import { useDashboardState } from '@/hooks/useDashboardState';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { ProjectAllFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
            noData='N/A'
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
        <Stack gap={0.5}>
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
  const { project, loading } = useDetailedProject(params.projectId);
  const isPrint = useIsPrintView();
  const navItems = useProjectDashboardNavItems(project);
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
      navLabel='Project'
      sidebar={
        <SideNavMenu
          items={navItems}
          access={project.access}
          pathParams={{ projectId: project.id }}
        />
      }
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      {...dashboardState}
    >
      <Container maxWidth='xl' disableGutters>
        <Outlet context={outletContext} />
      </Container>
    </DashboardContentContainer>
  );
};

export type ProjectDashboardContext = { project: ProjectAllFieldsFragment };
export const useProjectDashboardContext = () =>
  useOutletContext<ProjectDashboardContext>();

export default ProjectDashboard;
