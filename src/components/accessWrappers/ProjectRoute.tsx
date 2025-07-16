import { Navigate } from 'react-router-dom';

import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

import { ProjectPermissions } from '@/modules/permissions/types';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  DataCollectionFeatureRole,
  ProjectCoordinatedEntryFeatures,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Permission wrapper to be used for routes that rely on permissions granted through a project
 */
const ProjectRoute: React.FC<
  React.PropsWithChildren<{
    permissions?: ProjectPermissions | ProjectPermissions[];
    redirectRoute?: string;
    dataCollectionFeature?: DataCollectionFeatureRole;
    coordinatedEntryFeatures?: (keyof ProjectCoordinatedEntryFeatures)[]; // show the route if ANY of these coordinated entry features are enabled on the project
  }>
> = ({
  permissions,
  redirectRoute,
  dataCollectionFeature,
  children,
  coordinatedEntryFeatures,
}) => {
  const { project } = useProjectDashboardContext();
  const permissionsArray = ensureArray(permissions);
  const [hasPermission, { loading }] = useHasProjectPermissions(
    project.id,
    permissionsArray
  );

  if (
    dataCollectionFeature &&
    !project.dataCollectionFeatures
      .map((f) => f.role)
      .includes(dataCollectionFeature)
  ) {
    return <NotFound />;
  }

  // If the route requires a coordinated entry feature, check that it is enabled
  if (coordinatedEntryFeatures && coordinatedEntryFeatures.length > 0) {
    if (!project.coordinatedEntryFeatures) return <NotFound />; // No coordinated entry features in this project

    // Check that ANY of the specified features are true
    const anyFeatureEnabled = coordinatedEntryFeatures.some(
      (feature) => project.coordinatedEntryFeatures?.[feature] === true
    );

    if (!anyFeatureEnabled) return <NotFound />;
  }

  // If no permissions are specified, we assume the route is accessible
  if (loading) return <Loading />;

  if (permissionsArray.length > 0 && !hasPermission) {
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
