import { Navigate } from 'react-router-dom';

import { useClientDashboardContext } from '../pages/ClientDashboard';
import NotFound from '../pages/NotFound';

import useSafeParams from '@/hooks/useSafeParams';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentsRoute: React.FC<
  React.PropsWithChildren<{
    clientIdParam?: string;
    enrollmentIdParam?: string;
    view?: boolean;
    edit?: boolean;
    redirectRoute?: string;
    getRouteParams?: (params: {
      clientId?: string;
      enrollmentId?: string;
    }) => object;
  }>
> = ({
  clientIdParam = 'clientId',
  enrollmentIdParam = 'enrollmentId',
  edit = false,
  redirectRoute,
  getRouteParams = (x) => x,
  children,
}) => {
  const { [clientIdParam]: clientId, [enrollmentIdParam]: enrollmentId } =
    useSafeParams();

  // Use dashboard outlet context that gets set in ClientDashboard
  const { client, enrollment } = useClientDashboardContext();
  const [permissions] = useRootPermissions();

  let allowed;
  if (enrollment) {
    // If enrollment was resolved, we know the user has canViewEnrollmentDetails for this enrollment
    allowed = edit ? enrollment.access.canEditEnrollments : true;
  } else {
    allowed = edit
      ? permissions?.canEnrollClients
      : client.access.canViewEnrollmentDetails;
  }

  if (!allowed)
    return redirectRoute ? (
      <Navigate
        to={generateSafePath(
          redirectRoute,
          getRouteParams({ clientId, enrollmentId })
        )}
        replace
      />
    ) : (
      <NotFound />
    );

  return <>{children}</>;
};
export default EnrollmentsRoute;
