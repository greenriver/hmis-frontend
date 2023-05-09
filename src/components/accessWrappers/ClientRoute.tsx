import { useMemo } from 'react';

import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import useSafeParams from '@/hooks/useSafeParams';
import {
  useClientPermissions,
  useRootPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';

const ClientRoute: React.FC<
  React.PropsWithChildren<{ param?: string; view?: boolean; edit?: boolean }>
> = ({ view = false, edit = false, param = 'clientId', children }) => {
  const { [param]: clientId } = useSafeParams();

  const [clientPerms, clientStatus] = useClientPermissions(clientId || '');
  const [rootPerms, rootStatus] = useRootPermissions();

  const allowed = useMemo(() => {
    if (!clientPerms || !rootPerms) return false;
    const { canEditClient } = clientPerms;
    const { canViewClients } = rootPerms;

    if (view) return canViewClients;
    if (edit) return canEditClient;
  }, [clientPerms, rootPerms, view, edit]);

  if (!clientId) {
    console.error('Loaded ClientRoute without a clientId');
    return <NotFound />;
  }

  if (clientStatus.loading || rootStatus.loading) return <Loading />;
  if (!(clientStatus.data && rootStatus.data)) {
    console.error('Error loading permissions');
    return <NotFound />;
  }
  if (!allowed) return <NotFound />;

  return <>{children}</>;
};
export default ClientRoute;
