import Loading from '../elements/Loading';

import NotFound from './404';

import useSafeParams from '@/hooks/useSafeParams';
import { useHasProjectPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useGetProjectPermissionsQuery } from '@/types/gqlTypes';

const ProjectEditRoute: React.FC<
  React.PropsWithChildren<{ param?: string }>
> = ({ param = 'projectId', children }) => {
  const { [param]: projectId } = useSafeParams();

  const { data, loading } = useGetProjectPermissionsQuery({
    variables: { id: projectId || '' },
    skip: !projectId,
  });
  const canEdit = useHasProjectPermissions(projectId || '', [
    'canEditProjectDetails',
  ]);

  if (loading) return <Loading />;
  if (!data?.project) {
    console.error('Project not found');
    return <NotFound />;
  }
  if (!canEdit) return <NotFound />;

  return <>{children}</>;
};
export default ProjectEditRoute;
