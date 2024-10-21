import { Navigate } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';

import { ClientPermissions } from '@/modules/permissions/types';
import { useHasPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Permission wrapper to be used for outlets of the ClientDashboard
 */
const ClientRoute: React.FC<
  React.PropsWithChildren<{
    permissions: ClientPermissions | ClientPermissions[];
    redirectRoute?: string;
  }>
> = ({ permissions, redirectRoute, children }) => {
  const { client } = useClientDashboardContext();
  const hasPermission = useHasPermissions(client?.access, permissions, 'all');
  if (!hasPermission) {
    return redirectRoute ? (
      <Navigate
        to={generateSafePath(redirectRoute, { clientId: client?.id })}
        replace
      />
    ) : (
      <NotFound />
    );
  }

  return <>{children}</>;
};
export default ClientRoute;
