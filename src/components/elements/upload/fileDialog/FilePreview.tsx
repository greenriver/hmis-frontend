import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import FilePreviewUnavailable from '@/components/elements/upload/fileDialog/FilePreviewUnavailable';
import ImagePreview from '@/components/elements/upload/fileDialog/ImagePreview';
import PdfPreview from '@/components/elements/upload/fileDialog/PdfPreview';
import { FileFieldsFragment } from '@/types/gqlTypes';

const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const PDF_CONTENT_TYPE = 'application/pdf';
interface Props {
  file: FileFieldsFragment;
}

const FilePreview: React.FC<Props> = ({ file }) => {
  const previewContent = useMemo(() => {
    if (file.contentType && IMAGE_CONTENT_TYPES.includes(file.contentType)) {
      return <ImagePreview file={file} />;
    }
    if (file.contentType === PDF_CONTENT_TYPE) {
      return <PdfPreview file={file} />;
    }
    return <FilePreviewUnavailable url={file.url} />;
  }, [file]);

  return (
    <>
      <Typography p={2} variant='h6' component='p'>
        File Preview
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          m: 2,
          overflow: 'hidden', // hide overflow for horizontal PDFs
        }}
      >
        {previewContent}
      </Box>
    </>
  );
};

export default FilePreview;
