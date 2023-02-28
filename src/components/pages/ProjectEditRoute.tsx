import Loading from '../elements/Loading';

import NotFound from './404';

import useSafeParams from '@/hooks/useSafeParams';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';

const ProjectEditRoute: React.FC<
  React.PropsWithChildren<{ param?: string }>
> = ({ param = 'projectId', children }) => {
  const { [param]: projectId } = useSafeParams();

  const [canEdit, { loading, data }] = useHasProjectPermissions(
    projectId || '',
    ['canEditProjectDetails']
  );

  if (loading) return <Loading />;
  if (!data?.project) {
    console.error('Project not found');
    return <NotFound />;
  }
  if (!canEdit) return <NotFound />;

  return <>{children}</>;
};
export default ProjectEditRoute;
