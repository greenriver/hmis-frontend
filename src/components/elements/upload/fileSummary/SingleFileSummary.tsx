import React from 'react';
import SavedFileSummary from '@/components/elements/upload/fileSummary/SavedFileSummary';
import UnsavedFileSummary from '@/components/elements/upload/fileSummary/UnsavedFileSummary';
import { FileFieldsFragment } from '@/types/gqlTypes';

const SingleFileSummary = ({
  savedFile,
  unsavedFile,
  onRemove,
}: {
  savedFile?: FileFieldsFragment;
  unsavedFile?: File;
  onRemove: (file: FileFieldsFragment | File) => void;
}) => {
  return (
    <>
      {unsavedFile && (
        <UnsavedFileSummary
          file={unsavedFile}
          onRemove={() => onRemove(unsavedFile)}
          variant='stacked'
        />
      )}
      {savedFile && (
        <SavedFileSummary
          file={savedFile}
          onRemove={() => onRemove(savedFile)}
          variant='stacked'
        />
      )}
    </>
  );
};

export default SingleFileSummary;
