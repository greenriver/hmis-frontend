import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import useSafeParams from '@/hooks/useSafeParams';
import { useHasOrganizationPermissions } from '@/modules/permissions/useHasPermissionsHooks';

const OrganizationEditRoute: React.FC<
  React.PropsWithChildren<{ param?: string }>
> = ({ param = 'organizationId', children }) => {
  const { [param]: organizationId } = useSafeParams();

  const [canEdit, { loading, data }] = useHasOrganizationPermissions(
    organizationId || '',
    ['canEditOrganization']
  );

  if (loading) return <Loading />;
  if (!data?.organization) {
    console.error('Organization not found');
    return <NotFound />;
  }
  if (!canEdit) return <NotFound />;

  return <>{children}</>;
};
export default OrganizationEditRoute;
