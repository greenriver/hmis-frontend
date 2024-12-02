import { Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import FileSummary, {
  FileSummaryProps,
} from '@/components/elements/upload/FileSummary';
import theme from '@/config/theme';
import { FileDialog } from '@/modules/clientFiles/components/FileModal';

// Wrapper around FileSummary for representing a File, aka a file that has just now been uploaded to Active Storage but doesn't yet exist as a File record in our db.
const UploadedFileSummary: React.FC<{
  file: File;
  variant: FileSummaryProps['variant'];
  onRemove?: FileSummaryProps['onRemove'];
}> = ({ file, variant, onRemove }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <FileSummary
        fileName={file.name}
        showThumbnail={!!file.type.match(/^image/)}
        url={url}
        info={
          <Typography
            variant='body2'
            sx={{ color: theme.palette.warning.main }}
          >
            (unsaved)
          </Typography>
        }
        variant={variant}
        onRemove={onRemove}
        openPreview={() => setPreviewOpen(true)}
      />
      <FileDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={{
          url: url,
          contentType: file.type,
          name: file.name,
        }}
      />
    </>
  );
};

export default UploadedFileSummary;
