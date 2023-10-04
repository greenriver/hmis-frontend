import { Container } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

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
import { ClientFieldsFragment, useGetClientQuery } from '@/types/gqlTypes';

const ClientDashboard: React.FC = () => {
  const params = useSafeParams() as { clientId: string };
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

  const navItems: NavItem[] = useDashboardNavItems(client || undefined);

  const { currentPath, ...dashboardState } = useDashboardState();

  const outletContext: ClientDashboardContext | undefined = useMemo(
    () => (client ? { client, overrideBreadcrumbTitles } : undefined),
    [client]
  );

  const breadCrumbConfig = useClientBreadcrumbConfig(outletContext);
  const breadcrumbs = useDashboardBreadcrumbs(
    breadCrumbConfig,
    breadcrumbOverrides
  );

  if (loading || !navItems) return <Loading />;
  if (!client || !outletContext) return <NotFound />;

  if (isPrint) {
    return (
      <>
        <ClientPrintHeader client={client} />
        <Outlet context={outletContext} />
      </>
    );
  }

  return (
    <DashboardContentContainer
      navHeader={<ClientCardMini client={client} />}
      sidebar={<SideNavMenu items={navItems} />}
      contextHeader={<ContextHeaderContent breadcrumbs={breadcrumbs} />}
      navLabel='Client'
      {...dashboardState}
    >
      <Container maxWidth='xl' sx={{ pb: 6 }}>
        <Outlet context={outletContext} />
      </Container>
    </DashboardContentContainer>
  );
};

export type ClientDashboardContext = {
  client: ClientFieldsFragment;
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
