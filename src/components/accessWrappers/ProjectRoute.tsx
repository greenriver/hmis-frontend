import { Navigate } from 'react-router-dom';

import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import { ProjectPermissions } from '@/modules/permissions/types';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Permission wrapper to be used for routes that rely on permissions granted through a project
 */
const ProjectRoute: React.FC<
  React.PropsWithChildren<{
    permissions: ProjectPermissions | ProjectPermissions[];
    redirectRoute?: string;
  }>
> = ({ permissions, redirectRoute, children }) => {
  const { project } = useProjectDashboardContext();
  const [hasPermission, { loading }] = useHasProjectPermissions(
    project.id,
    ensureArray(permissions)
  );

  if (loading) return <Loading />;

  if (!hasPermission) {
    return redirectRoute ? (
      <Navigate
        to={generateSafePath(redirectRoute, {
          projectId: project.id,
        })}
        replace
      />
    ) : (
      <NotFound />
    );
  }

  return <>{children}</>;
};
export default ProjectRoute;
