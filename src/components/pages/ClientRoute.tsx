import { useMemo } from 'react';

import Loading from '../elements/Loading';

import NotFound from './NotFound';

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

  // const [allowed, { loading, data }] = useHasClientPermissions(
  //   clientId || '',
  //   compact([view ? 'canViewClient' : null, edit ? 'canEditClient' : null])
  // );

  console.log({ clientPerms });

  const allowed = useMemo(() => {
    if (!clientPerms || !rootPerms) return false;
    const { canViewClient, canEditClient } = clientPerms;
    const { canViewUnenrolledClients } = rootPerms;

    if (view) return canViewClient || canViewUnenrolledClients;
    if (edit) return canEditClient;
  }, [clientPerms, rootPerms, view, edit]);

  if (clientStatus.loading || rootStatus.loading) return <Loading />;
  if (!(clientStatus.data && rootStatus.data)) {
    console.error('Error loading permissions');
    return <NotFound />;
  }
  if (!allowed) return <NotFound />;

  return <>{children}</>;
};
export default ClientRoute;
