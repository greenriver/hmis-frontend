import { Box, Card, Divider, Stack } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React, { Fragment } from 'react';
import SavedFileSummary from '@/components/elements/upload/fileSummary/SavedFileSummary';
import UnsavedFileSummary from '@/components/elements/upload/fileSummary/UnsavedFileSummary';
import { FileFieldsFragment } from '@/types/gqlTypes';

const MultiFileSummaries = ({
  savedFiles,
  unsavedFiles,
  onRemove,
}: {
  savedFiles: FileFieldsFragment[];
  unsavedFiles: File[];
  onRemove: (file: FileFieldsFragment | File) => void;
}) => {
  return (
    <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
      <Stack aria-live='polite' divider={<Divider />}>
        {savedFiles.map((file) => {
          return (
            <SavedFileSummary
              key={file.id}
              file={file}
              onRemove={() => onRemove(file)}
              variant='row'
            />
          );
        })}
        {unsavedFiles.map((file) => {
          return (
            <Fragment key={file.name}>
              <UnsavedFileSummary
                key={file.name} // we enforce uniqueness on file names
                file={file}
                onRemove={() => onRemove(file)}
                variant='row'
              />
              <Box aria-live='polite' sx={visuallyHidden}>
                Uploaded {file.name}
              </Box>
            </Fragment>
          );
        })}
      </Stack>
    </Card>
  );
};

export default MultiFileSummaries;
