import { isEmpty } from 'lodash-es';
import React from 'react';

import Attachment from './Attachment';

import { GetFileDocument, GetFileQueryResult } from '@/types/gqlTypes';

export interface ImageProps {
  id: string;
}

const File: React.FC<ImageProps> = ({ id }) => {
  // todo @martha - consider overriding this to accept an existing file, maybe it wouldn't be that hard
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
};

export default File;
