import { useMemo } from 'react';
import { useGetFileBlobsQuery } from '@/types/gqlTypes';

const usePreviousUploads = (previouslyUploadedBlobIds: string[]) => {
  const blobData = useGetFileBlobsQuery({
    variables: { ids: previouslyUploadedBlobIds },
  });
  const previousUploads = useMemo(() => blobData.data?.fileBlobs, [blobData]);
  return { uploads: previousUploads };
};

export default usePreviousUploads;
