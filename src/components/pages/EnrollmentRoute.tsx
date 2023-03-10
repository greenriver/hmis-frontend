import { compact } from 'lodash-es';
import { Navigate } from 'react-router-dom';

import Loading from '../elements/Loading';

import NotFound from './404';

import useSafeParams from '@/hooks/useSafeParams';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
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
  view = false,
  edit = false,
  redirectRoute,
  getRouteParams = (x) => x,
  children,
}) => {
  const { [clientIdParam]: clientId, [enrollmentIdParam]: enrollmentId } =
    useSafeParams();

  const [allowed, { loading, data }] = useHasClientPermissions(
    clientId || '',
    compact([
      view ? 'canViewEnrollmentDetails' : null,
      edit ? 'canEditEnrollments' : null,
    ])
  );

  if (loading) return <Loading />;
  if (!data) {
    console.error('Error loading permissions');
    return <NotFound />;
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
