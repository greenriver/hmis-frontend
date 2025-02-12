import { Navigate } from 'react-router-dom';

import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { ProjectPermissions } from '@/modules/permissions/types';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Permission wrapper to be used for routes that rely on permissions grantred through and enrollment's project
 */
const EnrollmentProjectRoute: React.FC<
  React.PropsWithChildren<{
    permissions: ProjectPermissions | ProjectPermissions[];
    redirectRoute?: string;
  }>
> = ({ permissions, redirectRoute, children }) => {
  // Use dashboard outlet context that gets set in EnrollmentDashboard
  const { enrollment } = useEnrollmentDashboardContext();
  const [hasPermission, { loading }] = useHasProjectPermissions(
    enrollment?.project?.id || '',
    ensureArray(permissions)
  );

  if (loading) return <Loading />;

  if (!hasPermission) {
    return redirectRoute ? (
      <Navigate
        to={generateSafePath(redirectRoute, {
          clientId: enrollment?.client.id,
          enrollmentId: enrollment?.id,
        })}
        replace
      />
    ) : (
      <NotFound />
    );
  }

  return <>{children}</>;
};
export default EnrollmentProjectRoute;
