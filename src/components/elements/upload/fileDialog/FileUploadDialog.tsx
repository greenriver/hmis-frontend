import { DialogContent, DialogTitle } from '@mui/material';
import React from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import FileDialog, {
  FileDialogProps,
} from '@/components/elements/upload/fileDialog/FileDialog';

// Wrapper around FileDialog for representing a File, aka a file that has just now been uploaded to Active Storage but doesn't yet exist as a File record in our db.
const FileUploadDialog: React.FC<FileDialogProps> = ({ file, ...props }) => {
  return (
    <CommonDialog
      maxWidth='md'
      scroll='paper'
      fullWidth
      enableBackdropClick
      {...props}
    >
      <DialogTitle>{file.name}</DialogTitle>
      <DialogContent>
        <FileDialog file={file} />
      </DialogContent>
    </CommonDialog>
  );
};

export default FileUploadDialog;
