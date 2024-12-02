import { Typography } from '@mui/material';
import React, { useState } from 'react';
import FileSummary, {
  FileSummaryProps,
} from '@/components/elements/upload/FileSummary';
import FileRecordDialog from '@/modules/clientFiles/components/FileModal';
import {
  formatRelativeDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { FileFieldsFragment } from '@/types/gqlTypes';

// Wrapper around FileSummary for representing a FileFieldsFragment, aka a file that has already been saved as a File record in our db
const SavedFileSummary: React.FC<{
  file: FileFieldsFragment;
  variant: FileSummaryProps['variant'];
  onRemove?: FileSummaryProps['onRemove'];
}> = ({ file, variant, onRemove }) => {
  const date = parseHmisDateString(file.dateCreated);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <FileSummary
        fileName={file.name}
        showThumbnail={Boolean(
          file.contentType && !!file.contentType.match(/^image/)
        )}
        url={file.url || ''}
        info={
          date && (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Uploaded {formatRelativeDate(date)}
            </Typography>
          )
        }
        variant={variant}
        onRemove={onRemove}
        openPreview={() => setPreviewOpen(true)}
      />
      <FileRecordDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={file}
      />
    </>
  );
};

export default SavedFileSummary;
