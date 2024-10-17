import { Navigate } from 'react-router-dom';

import { useEnrollmentDashboardContext } from '../pages/EnrollmentDashboard';
import NotFound from '../pages/NotFound';

import { EnrollmentPermissions } from '@/modules/permissions/types';
import { useHasPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { DataCollectionFeatureRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Permission wrapper to be used for outlets of the EnrollmentDashboard
 */
const EnrollmentRoute: React.FC<
  React.PropsWithChildren<{
    permissions?: EnrollmentPermissions | EnrollmentPermissions[];
    redirectRoute?: string;
    dataCollectionFeature?: DataCollectionFeatureRole;
  }>
> = ({ permissions, redirectRoute, dataCollectionFeature, children }) => {
  // Use dashboard outlet context that gets set in EnrollmentDashboard
  const { enrollment, enabledFeatures } = useEnrollmentDashboardContext();
  const hasPermission = useHasPermissions(
    enrollment?.access,
    permissions || []
  );

  if (
    dataCollectionFeature &&
    !enabledFeatures.includes(dataCollectionFeature)
  ) {
    return <NotFound />;
  }

  if (!!permissions && !hasPermission) {
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
