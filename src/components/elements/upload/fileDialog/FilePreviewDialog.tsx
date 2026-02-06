import { DialogProps, Paper, Stack } from '@mui/material';
import React, { useMemo } from 'react';

import FilePreview from '@/components/elements/upload/fileDialog/FilePreview';
import useSafeParams from '@/hooks/useSafeParams';
import ViewRecordDialog from '@/modules/form/components/ViewRecordDialog';
import { FileFieldsFragment, RecordFormRole } from '@/types/gqlTypes';

// component for viewing a FileFieldsFragment. Viewing an unsaved File is not currently supported
export type FileRecordDialogProps = {
  file: FileFieldsFragment;
  actions?: React.ReactNode;
} & DialogProps;
const FilePreviewDialog: React.FC<FileRecordDialogProps> = ({
  file,
  actions,
  ...props
}) => {
  const { clientId } = useSafeParams() as { clientId?: string };
  const pickListArgs = useMemo(() => ({ clientId }), [clientId]);

  return (
    <ViewRecordDialog<FileFieldsFragment>
      {...props}
      record={file}
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
          <FilePreview file={file} />
        </Paper>
      </Stack>
    </ViewRecordDialog>
  );
};

export default FilePreviewDialog;
