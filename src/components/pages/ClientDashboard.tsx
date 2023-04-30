import { Container } from '@mui/material';
import { useMemo, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

import { useEnrollment } from '../../modules/dataFetching/hooks/useEnrollment';
import Loading from '../elements/Loading';
import ContextHeaderContent from '../layout/dashboard/contextHeader/ContextHeaderContent';
import DashboardContentContainer from '../layout/dashboard/DashboardContentContainer';
import SideNavMenu from '../layout/dashboard/sideNav/SideNavMenu';
import { NavItem } from '../layout/dashboard/sideNav/types';
import { useDashboardNavItems } from '../layout/dashboard/sideNav/useDashboardNavItems';

import NotFound from './NotFound';

import { useDashboardState } from '@/hooks/useDashboardState';
import useSafeParams from '@/hooks/useSafeParams';
import ClientCardMini from '@/modules/client/components/ClientCardMini';
import {
  ClientFieldsFragment,
  EnrollmentFieldsFragment,
  useGetClientQuery,
} from '@/types/gqlTypes';

const ClientDashboard: React.FC = () => {
  const params = useSafeParams() as {
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
    variables: { id: params.clientId },
  });
  if (error) throw error;

  const { enrollment, loading: enrollmentLoading } = useEnrollment(
    params.enrollmentId
  );

  const navItems: NavItem[] = useDashboardNavItems(client || undefined);

  const dashboardState = useDashboardState();

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

  if (loading || enrollmentLoading || !navItems) return <Loading />;
  if (!client || !outletContext) return <NotFound />;
  if (enrollment && enrollment.client.id !== params.clientId) {
    return <NotFound />;
  }

  return (
    <DashboardContentContainer
      navHeader={<ClientCardMini client={client} />}
      sidebar={<SideNavMenu items={navItems} />}
      contextHeader={
        <ContextHeaderContent
          breadcrumbOverrides={breadcrumbOverrides}
          dashboardContext={outletContext}
        />
      }
      navLabel='Client Navigation'
      {...dashboardState}
    >
      <Container maxWidth='lg' sx={{ pb: 6 }}>
        <Outlet context={outletContext} />
      </Container>
    </DashboardContentContainer>
  );
};

export type ClientDashboardContext = {
  client: ClientFieldsFragment;
  enrollment?: EnrollmentFieldsFragment;
  overrideBreadcrumbTitles: (crumbs: any) => void;
};
export const useClientDashboardContext = () =>
  useOutletContext<ClientDashboardContext>();

export default ClientDashboard;
