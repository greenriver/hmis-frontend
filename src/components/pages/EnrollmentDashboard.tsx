import { Container } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import Loading from '../elements/Loading';
import ContextHeaderContent from '../layout/dashboard/contextHeader/ContextHeaderContent';
import DashboardContentContainer from '../layout/dashboard/DashboardContentContainer';
import SideNavMenu from '../layout/dashboard/sideNav/SideNavMenu';
import NotFound from './NotFound';

import {
  useDashboardBreadcrumbs,
  useEnrollmentBreadcrumbConfig,
} from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';
import { useDashboardState } from '@/hooks/useDashboardState';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import ClientPrintHeader from '@/modules/client/components/ClientPrintHeader';
import EnrollmentNavHeader from '@/modules/enrollment/components/EnrollmentNavHeader';
import { useDetailedEnrollment } from '@/modules/enrollment/hooks/useDetailedEnrollment';
import { useEnrollmentDashboardNavItems } from '@/modules/enrollment/hooks/useEnrollmentDashboardNavItems';
import { featureEnabledForEnrollment } from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { EnrollmentDashboardRoutes, HIDE_NAV_ROUTES } from '@/routes/routes';
import {
  ClientNameDobVetFragment,
  DataCollectionFeatureRole,
} from '@/types/gqlTypes';

const EnrollmentDashboard: React.FC = () => {
  const params = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    formRole?: string;
  };
  const isPrint = useIsPrintView();

  const [breadcrumbOverrides, overrideBreadcrumbTitles] = useState<
    Record<string, string> | undefined
  >();

  const { enrollment, loading } = useDetailedEnrollment(params.enrollmentId);
  const client = enrollment?.client;

  const enabledFeatures = useMemo(
    () =>
      enrollment
        ? enrollment.project.dataCollectionFeatures
            .filter((feature) =>
              featureEnabledForEnrollment(
                feature,
                enrollment.client,
                enrollment.relationshipToHoH
              )
            )
            .map((r) => r.role)
        : [],
    [enrollment]
  );

  const navItems = useEnrollmentDashboardNavItems(enabledFeatures);

  const { currentPath, setFocusMode, ...dashboardState } = useDashboardState();

  const focusMode = useMemo(() => {
    if (dashboardState.focusMode) return dashboardState.focusMode;
    // hacky way to set "focus" for household assessments
    if (currentPath && HIDE_NAV_ROUTES.includes(currentPath)) {
      return EnrollmentDashboardRoutes.ASSESSMENTS;
    }
  }, [dashboardState.focusMode, currentPath]);

  const outletContext: EnrollmentDashboardContext | undefined = useMemo(
    () =>
      client && enrollment
        ? {
            client,
            overrideBreadcrumbTitles,
            enrollment,
            enabledFeatures,
            setFocusMode,
          }
        : undefined,
    [client, enrollment, enabledFeatures, setFocusMode]
  );

  const breadCrumbConfig = useEnrollmentBreadcrumbConfig(outletContext);
  const breadcrumbs = useDashboardBreadcrumbs(
    breadCrumbConfig,
    breadcrumbOverrides
  );

  if (loading || !navItems) return <Loading />;
  if (!enrollment || !client || !outletContext) return <NotFound />;
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
      navHeader={<EnrollmentNavHeader enrollment={enrollment} />}
      sidebar={
        <SideNavMenu
          items={navItems}
          access={enrollment.access}
          pathParams={{
            clientId: enrollment.client.id,
            enrollmentId: enrollment.id,
          }}
        />
      }
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      navLabel='Enrollment'
      {...dashboardState}
      focusMode={focusMode}
    >
      {focusMode ? (
        // focused views like household intake/exit shouldn't have a container
        <Outlet context={outletContext} />
      ) : (
        <Container maxWidth='xl' sx={{ pb: 6 }}>
          <Outlet context={outletContext} />
        </Container>
      )}
    </DashboardContentContainer>
  );
};

export type EnrollmentDashboardContext = {
  client: ClientNameDobVetFragment;
  enrollment?: DashboardEnrollment;
  overrideBreadcrumbTitles: (crumbs: any) => void;
  enabledFeatures: DataCollectionFeatureRole[];
};

export function isEnrollmentDashboardContext(
  value: EnrollmentDashboardContext | ProjectDashboardContext
): value is EnrollmentDashboardContext {
  return (
    !isNil(value) &&
    typeof value === 'object' &&
    !!value.hasOwnProperty('client') &&
    !!value.hasOwnProperty('enrollment')
  );
}

export const useEnrollmentDashboardContext = () =>
  useOutletContext<EnrollmentDashboardContext>();

export default EnrollmentDashboard;
