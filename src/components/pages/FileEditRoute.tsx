import Loading from '../elements/Loading';

import NotFound from './404';

import useSafeParams from '@/hooks/useSafeParams';
import { useClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useGetFileQuery } from '@/types/gqlTypes';

const FileEditRoute: React.FC<
  React.PropsWithChildren<{
    clientIdParam?: string;
    fileIdParam?: string;
    create?: boolean;
  }>
> = ({
  clientIdParam = 'clientId',
  fileIdParam = 'fileId',
  create = true,
  children,
}) => {
  const { [clientIdParam]: clientId, [fileIdParam]: fileId } = useSafeParams();

  const file = useGetFileQuery({
    variables: { id: fileId || '' },
    skip: !fileId,
  });
  const [permissions, { loading }] = useClientPermissions(clientId || '');

  const canEdit =
    permissions?.canManageAnyClientFiles ||
    permissions?.canManageOwnClientFiles;
  const canEditAny = permissions?.canManageAnyClientFiles;

  if (loading) return <Loading />;
  if (!file && !create) {
    console.error('File not found');
    return <NotFound />;
  }
  if (!canEdit) return <NotFound />;
  if (!create && !canEditAny && !file.data?.file?.ownFile) return <NotFound />;

  return <>{children}</>;
};
export default FileEditRoute;
