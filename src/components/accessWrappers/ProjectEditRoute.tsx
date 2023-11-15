import { Navigate } from 'react-router-dom';

import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import useSafeParams from '@/hooks/useSafeParams';
import { ProjectPermissions } from '@/modules/permissions/types';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectEditRoute: React.FC<
  React.PropsWithChildren<{
    param?: string;
    permissions?: ProjectPermissions[];
    redirectRoute?: string;
    getRouteParams?: (params: { projectId?: string }) => object;
  }>
> = ({
  param = 'projectId',
  redirectRoute,
  getRouteParams = (x) => x,
  permissions = ['canEditProjectDetails'],
  children,
}) => {
  const { [param]: projectId } = useSafeParams();

  const [canEdit, { loading, data }] = useHasProjectPermissions(
    projectId || '',
    permissions
  );

  if (loading) return <Loading />;
  if (!data?.project) {
    console.error('Project not found');
    return <NotFound />;
  }
  if (!canEdit)
    return redirectRoute ? (
      <Navigate
        to={generateSafePath(redirectRoute, getRouteParams({ projectId }))}
        replace
      />
    ) : (
      <NotFound />
    );

  return <>{children}</>;
};
export default ProjectEditRoute;
