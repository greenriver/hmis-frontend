import { Container } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import { useEnrollment } from '../../modules/dataFetching/hooks/useEnrollment';
import { showAssessmentInHousehold } from '../clientDashboard/enrollments/AssessmentPage';
import Loading from '../elements/Loading';
import ContextHeaderContent from '../layout/dashboard/contextHeader/ContextHeaderContent';
import DashboardContentContainer from '../layout/dashboard/DashboardContentContainer';
import SideNavMenu from '../layout/dashboard/sideNav/SideNavMenu';
import { NavItem } from '../layout/dashboard/sideNav/types';
import { useDashboardNavItems } from '../layout/dashboard/sideNav/useDashboardNavItems';

import NotFound from './NotFound';

import {
  useClientBreadcrumbConfig,
  useDashboardBreadcrumbs,
} from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';
import { useDashboardState } from '@/hooks/useDashboardState';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import ClientCardMini from '@/modules/client/components/ClientCardMini';
import ClientPrintHeader from '@/modules/client/components/ClientPrintHeader';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  EnrollmentFieldsFragment,
  useGetClientQuery,
} from '@/types/gqlTypes';

const ClientDashboard: React.FC = () => {
  const params = useSafeParams() as {
    clientId: string;
    enrollmentId?: string;
    formRole?: string;
  };
  const isPrint = useIsPrintView();

  const [breadcrumbOverrides, overrideBreadcrumbTitles] = useState<
    Record<string, string> | undefined
  >();

  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientQuery({
    variables: { id: params.clientId },
  });
  if (error) throw error;

  const { enrollment, loading: enrollmentLoading } = useEnrollment(
    params.enrollmentId
  );

  const navItems: NavItem[] = useDashboardNavItems(client || undefined);

  const { currentPath, ...dashboardState } = useDashboardState();

  const focusMode = useMemo(() => {
    if (dashboardState.focusMode) return dashboardState.focusMode;
    // hacky way to set "focus" for household assessments, which depends on the household size
    if (
      currentPath === ClientDashboardRoutes.ASSESSMENT &&
      showAssessmentInHousehold(enrollment, params.formRole)
    ) {
      return ClientDashboardRoutes.VIEW_ENROLLMENT;
    }
  }, [enrollment, dashboardState.focusMode, currentPath, params.formRole]);

  const outletContext: ClientDashboardContext | undefined = useMemo(
    () =>
      client && !enrollmentLoading
        ? {
            client,
            overrideBreadcrumbTitles,
            enrollment,
          }
        : undefined,
    [client, enrollment, enrollmentLoading]
  );

  const breadCrumbConfig = useClientBreadcrumbConfig(outletContext);
  const breadcrumbs = useDashboardBreadcrumbs(
    breadCrumbConfig,
    breadcrumbOverrides
  );

  if (loading || enrollmentLoading || !navItems) return <Loading />;
  if (!client || !outletContext) return <NotFound />;
  if (enrollment && enrollment.client.id !== params.clientId) {
    return <NotFound />;
  }

  if (isPrint) {
    return (
      <>
        <ClientPrintHeader client={client} enrollment={enrollment} />
        <Outlet context={outletContext} />
      </>
    );
  }

  return (
    <DashboardContentContainer
      navHeader={<ClientCardMini client={client} />}
      sidebar={<SideNavMenu items={navItems} />}
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      navLabel='Client Navigation'
      {...dashboardState}
      focusMode={focusMode}
    >
      {focusMode ? (
        // focused views like household intake/exit shouldn't have a container
        <Outlet context={outletContext} />
      ) : (
        <Container maxWidth='lg' sx={{ pb: 6 }}>
          <Outlet context={outletContext} />
        </Container>
      )}
    </DashboardContentContainer>
  );
};

export type ClientDashboardContext = {
  client: ClientFieldsFragment;
  enrollment?: EnrollmentFieldsFragment;
  overrideBreadcrumbTitles: (crumbs: any) => void;
};

export function isClientDashboardContext(
  value: ClientDashboardContext | ProjectDashboardContext
): value is ClientDashboardContext {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !!value.hasOwnProperty('client')
  );
}

export const useClientDashboardContext = () =>
  useOutletContext<ClientDashboardContext>();

export default ClientDashboard;
