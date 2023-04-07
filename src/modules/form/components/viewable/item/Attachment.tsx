import { useQuery } from '@apollo/client';
import { Box, CircularProgress, Link, Typography } from '@mui/material';
import { DocumentNode } from 'graphql';
import React, { useMemo } from 'react';

import NotCollectedText from './NotCollectedText';

export interface AttachmentAttrs {
  name?: string;
  url?: string;
  contentType?: string;
}

export type AttachmentProps = {
  attachmentVariables: Record<string, any>;
  attachmentQuery: DocumentNode;
  getAttrsFromResults: (results: any) => AttachmentAttrs;
  getNotFound: (results?: any) => boolean;
  noName?: boolean;
  noDownload?: boolean;
};

const Attachment: React.FC<AttachmentProps> = ({
  attachmentVariables,
  attachmentQuery,
  getAttrsFromResults,
  getNotFound,
  noName = false,
  noDownload = false,
}) => {
  const { data, loading } = useQuery(attachmentQuery, {
    variables: attachmentVariables,
  });
  const { name, url, contentType } = useMemo(
    () => (data ? getAttrsFromResults(data) : {}),
    [getAttrsFromResults, data]
  );

  const notFound = useMemo(() => getNotFound(data), [getNotFound, data]);
  const isImage = useMemo(
    () => contentType?.match(/^image\/.*/),
    [contentType]
  );

  if (loading) return <CircularProgress size={45} />;

  if (notFound) return <NotCollectedText variant='body2' />;

  return (
    <Box>
      {name && !noName && <Typography gutterBottom>{name}</Typography>}
      {isImage && url && (
        <Box component='img' sx={{ maxHeight: 150 }} src={url} alt={name} />
      )}
      {url && !noDownload && (
        <Typography>
          <Link href={url} download>
            Download
          </Link>
        </Typography>
      )}
    </Box>
  );
};

export default Attachment;
