import { Typography } from '@mui/material';
import React, { useMemo } from 'react';
import FileSummary, {
  FileSummaryProps,
} from '@/components/elements/upload/fileSummary/FileSummary';
import theme from '@/config/theme';

// Wrapper around FileSummary for representing a File, aka a file that has just now been uploaded to Active Storage but doesn't yet exist as a File record in our db.
const FileUploadSummary: React.FC<{
  file: File;
  variant: FileSummaryProps['variant'];
  onRemove?: FileSummaryProps['onRemove'];
}> = ({ file, variant, onRemove }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  return (
    <>
      <FileSummary
        fileName={file.name}
        showThumbnail={!!file.type.match(/^image/)}
        url={url}
        info={
          <Typography
            variant='body2'
            color='warning.dark' # TODO(#718) use warning text color
          >
            (unsaved)
          </Typography>
        }
        variant={variant}
        onRemove={onRemove}
        permitDownload={false}
      />
    </>
  );
};

export default FileUploadSummary;
