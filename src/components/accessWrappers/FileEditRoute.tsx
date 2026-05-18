import Loading from '../elements/Loading';
import NotFound from '../pages/NotFound';

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

  if (loading) return <Loading />;
  if (!file && !create) {
    console.error('File not found');
    return <NotFound />;
  }

  // If uploading, check on the client whether the user can upload files
  if (create && !permissions?.canUploadClientFiles) return <NotFound />;
  // If attempting to edit an existing file, check permission on the file
  if (!create && !file.data?.file?.access?.canManage) return <NotFound />;

  return <>{children}</>;
};
export default FileEditRoute;
