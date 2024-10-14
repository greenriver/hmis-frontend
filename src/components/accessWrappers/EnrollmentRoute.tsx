import { Navigate } from 'react-router-dom';

import NotFound from '../pages/NotFound';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';

import { EnrollmentPermissions } from '@/modules/permissions/types';
import { useHasPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Permission wrapper to be used for outlets of the EnrollmentDashboard
 */
const EnrollmentRoute: React.FC<
  React.PropsWithChildren<{
    permissions: EnrollmentPermissions | EnrollmentPermissions[];
    redirectRoute?: string;
  }>
> = ({ permissions, redirectRoute, children }) => {
  // Use dashboard outlet context that gets set in EnrollmentDashboard
  const { enrollment } = useEnrollmentDashboardContext();
  const hasPermission = useHasPermissions(enrollment?.access, permissions);
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
export default EnrollmentRoute;
