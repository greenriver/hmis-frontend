import { useMutation, gql } from '@apollo/client';
import { BlobUpload } from '@rails/activestorage/src/blob_upload';
import { useCallback, useMemo, useState } from 'react';

import { getFileMetadata } from './getFileMetadata';

import { DirectUpload } from '@/types/gqlTypes';

const OPERATION = gql`
  mutation CreateDirectUploadMutation($input: DirectUploadInput!) {
    createDirectUpload(input: { input: $input }) {
      filename
      headers
      url
      blobId
      signedBlobId
    }
  }
`;

export const directUpload = (url: string, headers: any, file: File) => {
  const upload = new BlobUpload({ file, directUploadData: { url, headers } });
  return new Promise((resolve, reject) => {
    upload.create((error: Error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
};

type ResultsType = {
  createDirectUpload: DirectUpload;
};
type Status = { error: boolean; loading: boolean };
const useDirectUpload = () => {
  const [mutate] = useMutation<ResultsType>(OPERATION);
  const [status, setStatus] = useState<Status>({
    loading: false,
    error: false,
  });
  const cb = useCallback(
    async (file: File) => {
      setStatus({ loading: true, error: false });
      const input = await getFileMetadata(file);
      const { data: presigned } = await mutate({ variables: { input } });

      if (presigned) {
        const { url, headers } = presigned.createDirectUpload;
        await directUpload(url, JSON.parse(headers), file);
        setStatus({ loading: false, error: false });
        return Promise.resolve(presigned.createDirectUpload);
      }
      return Promise.reject();
    },
    [mutate]
  );
  return useMemo(() => [cb, status] as const, [cb, status]);
};

export default useDirectUpload;
