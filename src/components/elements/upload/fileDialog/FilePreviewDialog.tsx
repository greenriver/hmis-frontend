import { DialogProps, Paper, Stack } from '@mui/material';
import React, { useMemo } from 'react';

import FilePreview from '@/components/elements/upload/fileDialog/FilePreview';
import useSafeParams from '@/hooks/useSafeParams';
import ViewRecordDialog from '@/modules/form/components/ViewRecordDialog';
import {
  FileFieldsFragment,
  FileWithCustomDataElementsFieldsFragment,
  RecordFormRole,
} from '@/types/gqlTypes';

// component for viewing a saved File. Viewing an unsaved File is not currently supported.
// Files without custom data elements loaded (eg attachments) are shown with none.
export type FileRecordDialogProps = {
  file: FileFieldsFragment | FileWithCustomDataElementsFieldsFragment;
  actions?: React.ReactNode;
} & DialogProps;
const FilePreviewDialog: React.FC<FileRecordDialogProps> = ({
  file,
  actions,
  ...props
}) => {
  const { clientId } = useSafeParams() as { clientId?: string };
  const pickListArgs = useMemo(() => ({ clientId }), [clientId]);
  const record: FileWithCustomDataElementsFieldsFragment = useMemo(
    () => ({ customDataElements: [], ...file }),
    [file]
  );

  return (
    <ViewRecordDialog<FileWithCustomDataElementsFieldsFragment>
      {...props}
      record={record}
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
