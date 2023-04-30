import { compact } from 'lodash-es';

import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';

const ClientRoute: React.FC<
  React.PropsWithChildren<{ param?: string; view?: boolean; edit?: boolean }>
> = ({ view = false, edit = false, children }) => {
  const [allowed, { loading, data }] = useHasRootPermissions(
    compact([view ? 'canViewClients' : null, edit ? 'canEditClients' : null])
  );

  if (loading) return <Loading />;
  if (!data) {
    console.error('Error loading permissions');
    return <NotFound />;
  }
  if (!allowed) return <NotFound />;

  return <>{children}</>;
};
export default ClientRoute;
