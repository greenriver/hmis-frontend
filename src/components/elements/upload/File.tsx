import { isEmpty } from 'lodash-es';
import React from 'react';

import Attachment from './Attachment';

import { GetFileDocument, GetFileQueryResult } from '@/types/gqlTypes';

interface FileComponentProps {
  id: string;
}

export const FileComponent: React.FC<FileComponentProps> = ({ id }) => {
  return (
    <Attachment
      attachmentQuery={GetFileDocument}
      attachmentVariables={{ id }}
      getNotFound={(data?: GetFileQueryResult['data']) =>
        !data?.file || isEmpty(data?.file)
      }
      getAttrsFromResults={(data: GetFileQueryResult['data']) => {
        const file = data?.file;

        return {
          url: file?.url || '',
          name: file?.name,
          contentType: file?.contentType || '',
        };
      }}
    />
  );
  // todo @martha - consider overriding this to accept an existing file, maybe it wouldn't be that hard
};

export default FileComponent;
