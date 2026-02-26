import { Box } from '@mui/material';
import React, { useState } from 'react';

import Loading from '@/components/elements/Loading';
import FilePreviewUnavailable from '@/components/elements/upload/fileDialog/FilePreviewUnavailable';
import { FileFieldsFragment } from '@/types/gqlTypes';

interface Props {
  file: FileFieldsFragment;
}

const ImagePreview: React.FC<Props> = ({ file }) => {
  const [loaded, setLoaded] = useState<boolean>(false);

  if (!file.url) return <FilePreviewUnavailable />;

  return (
    <Box>
      {!loaded && <Loading />}
      <Box
        sx={{
          boxShadow: 'shadows.1',
          backgroundColor: 'background.paper',
          borderRadius: 'shape.borderRadius',
          maxWidth: '100%',
          display: loaded ? undefined : 'none',
        }}
        component='img'
        src={file.url}
        onLoad={() => setLoaded(true)}
        alt={file.name}
      />
    </Box>
  );
};

export default ImagePreview;
