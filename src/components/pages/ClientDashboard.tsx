import { useCallback, useMemo, useState } from 'react';
import { Outlet, useOutletContext, useParams } from 'react-router-dom';

import { useEnrollment } from '../dashboard/enrollments/useEnrollment';
import ClientCardMini from '../elements/ClientCardMini';
import Loading from '../elements/Loading';
import ContextHeaderContent from '../layout/dashboard/contextHeader/ContextHeaderContent';
import DashboardContentContainer from '../layout/dashboard/DashboardContentContainer';
import SideNavMenu, { NavItem } from '../layout/dashboard/sideNav/SideNavMenu';
import { useDashboardNavItems } from '../layout/dashboard/sideNav/useDashboardNavItems';

import ClientIdEncoder from '@/modules/hmis/ClientIdEncoder';
import {
  ClientFieldsFragment,
  EnrollmentFieldsFragment,
  useGetClientQuery,
} from '@/types/gqlTypes';

const ClientDashboard: React.FC = () => {
  const params = useParams() as {
    clientId: string;
    enrollmentId?: string;
  };

  const [breadcrumbOverrides, overrideBreadcrumbTitles] = useState<
    Record<string, string> | undefined
  >();

  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientQuery({
    variables: { id: ClientIdEncoder.decode(params.clientId) },
  });
  if (error) throw error;

  const { enrollment, loading: enrollmentLoading } = useEnrollment(
    params.enrollmentId
  );

  const navItems: NavItem[] = useDashboardNavItems(client?.id);

  const outletContext: DashboardContext | undefined = useMemo(
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

  const [desktopNavIsOpen, setDesktopNavState] = useState(true);
  const [mobileNavIsOpen, setMobileNavState] = useState(false);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileNavState(false);
  }, []);
  const handleOpenMobileMenu = useCallback(() => {
    console.log('handleOpenMobileMenu');
    setMobileNavState(true);
  }, []);
  const handleCloseDesktopMenu = useCallback(() => {
    setDesktopNavState(false);
  }, []);
  const handleOpenDesktopMenu = useCallback(() => {
    setDesktopNavState(true);
  }, []);

  if (loading || enrollmentLoading || !navItems) return <Loading />;
  if (!client || !outletContext) throw Error('Client not found');

  return (
    <DashboardContentContainer
      navHeader={<ClientCardMini client={client} />}
      desktopNavIsOpen={desktopNavIsOpen}
      mobileNavIsOpen={mobileNavIsOpen}
      handleCloseMobileMenu={handleCloseMobileMenu}
      handleCloseDesktopMenu={handleCloseDesktopMenu}
      handleOpenDesktopMenu={handleOpenDesktopMenu}
      handleOpenMobileMenu={handleOpenMobileMenu}
      // TODO add back to standardize headers
      // header={header}
      sidebar={<SideNavMenu items={navItems} />}
      contextHeader={
        <ContextHeaderContent
          breadcrumbOverrides={breadcrumbOverrides}
          dashboardContext={outletContext}
        />
      }
    >
      <Outlet context={outletContext} />
    </DashboardContentContainer>
  );
};

export type DashboardContext = {
  client: ClientFieldsFragment;
  enrollment?: EnrollmentFieldsFragment;
  overrideBreadcrumbTitles: (crumbs: any) => void;
};
export const useDashboardClient = () => useOutletContext<DashboardContext>();

export default ClientDashboard;
