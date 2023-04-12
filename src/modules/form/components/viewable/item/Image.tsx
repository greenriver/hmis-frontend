import React from 'react';

import Attachment from './Attachment';

import {
  GetClientImageDocument,
  GetClientImageQueryResult,
} from '@/types/gqlTypes';

export interface ImageProps {
  id: string;
}

const Image: React.FC<ImageProps> = ({ id }) => {
  return (
    <Attachment
      attachmentQuery={GetClientImageDocument}
      attachmentVariables={{ id }}
      getNotFound={(data?: GetClientImageQueryResult['data']) =>
        !data?.client?.image
      }
      getAttrsFromResults={(data: GetClientImageQueryResult['data']) => {
        const image = data?.client?.image;
        const base64 = image?.base64;

        return {
          url: base64?.match(new RegExp('^data:image/jpeg;base64,'))
            ? base64
            : `data:image/jpeg;base64,${base64}`,
          contentType: image?.contentType,
        };
      }}
    />
  );
};

export default Image;
