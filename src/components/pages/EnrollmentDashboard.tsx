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
import { useEnrollmentDashboardNavItems } from '@/modules/enrollment/hooks/useEnrollmentDashboardNavItems';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientNameDobVetFragment,
  EnrollmentFieldsFragment,
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

  const { enrollment, loading } = useEnrollment(params.enrollmentId);
  const client = enrollment?.client;

  const navItems: NavItem[] = useEnrollmentDashboardNavItems(
    enrollment || undefined
  );

  const { currentPath, ...dashboardState } = useDashboardState();

  const focusMode = useMemo(() => {
    if (dashboardState.focusMode) return dashboardState.focusMode;
    // hacky way to set "focus" for household assessments, which depends on the household size
    if (
      currentPath === EnrollmentDashboardRoutes.ASSESSMENT &&
      showAssessmentInHousehold(enrollment, params.formRole)
    ) {
      return EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW;
    }
  }, [enrollment, dashboardState.focusMode, currentPath, params.formRole]);

  const outletContext: EnrollmentDashboardContext | undefined = useMemo(
    () =>
      client && enrollment
        ? {
            client,
            overrideBreadcrumbTitles,
            enrollment,
          }
        : undefined,
    [client, enrollment]
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
      sidebar={<SideNavMenu items={navItems} />}
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      navLabel='Enrollment'
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

export type EnrollmentDashboardContext = {
  client: ClientNameDobVetFragment;
  enrollment?: EnrollmentFieldsFragment;
  overrideBreadcrumbTitles: (crumbs: any) => void;
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
