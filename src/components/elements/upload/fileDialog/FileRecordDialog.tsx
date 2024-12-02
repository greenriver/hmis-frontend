import { DialogProps, Paper, Stack } from '@mui/material';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js?url';
import React, { useMemo } from 'react';
import { pdfjs } from 'react-pdf';
import FileDialog from '@/components/elements/upload/fileDialog/FileDialog';
import useSafeParams from '@/hooks/useSafeParams';
import ViewRecordDialog from '@/modules/form/components/ViewRecordDialog';
import { FileFieldsFragment, RecordFormRole } from '@/types/gqlTypes';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Wrapper around FileDialog for representing a FileFieldsFragment, aka a file that has already been saved as a File record in our db
export type FileRecordDialogProps = {
  file: FileFieldsFragment;
  actions?: React.ReactNode;
} & DialogProps;
const FileRecordDialog: React.FC<FileRecordDialogProps> = ({
  file,
  actions,
  ...props
}) => {
  const { clientId } = useSafeParams() as { clientId?: string };
  const pickListArgs = useMemo(() => ({ clientId }), [clientId]);

  return (
    <ViewRecordDialog<FileFieldsFragment>
      {...props}
      record={file as FileFieldsFragment}
      formRole={RecordFormRole.File}
      title={file.name}
      actions={actions}
      pickListArgs={pickListArgs}
    >
      <Stack
        width='100%'
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Paper sx={{ width: '100%' }}>
          <FileDialog file={file} />
        </Paper>
      </Stack>
    </ViewRecordDialog>
  );
};

export default FileRecordDialog;
