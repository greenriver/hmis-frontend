import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

import { FileFieldsFragment } from '@/types/gqlTypes';

export type FileDialogProps = {
  file: FileFieldsFragment;
  actions?: React.ReactNode;
} & DialogProps;

const FileDialog: React.FC<FileDialogProps> = ({ file, actions, ...props }) => {
  const { onClose } = props;
  return (
    <Dialog maxWidth='lg' fullWidth {...props}>
      <DialogTitle>
        <Stack
          direction='row'
          justifyContent='space-between'
          gap={2}
          alignItems='center'
        >
          <Typography
            sx={{
              fontSize: '1.5rem',
              color: (theme) => theme.palette.text.primary,
            }}
          >
            {file.name}
          </Typography>
          {onClose && (
            <IconButton onClick={(evt) => onClose(evt, 'escapeKeyDown')}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
      {actions && (
        <DialogContent>
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            flexGrow={1}
          >
            {actions}
          </Stack>
        </DialogContent>
      )}
      <Divider />
      <DialogContent>PREVIEW</DialogContent>
    </Dialog>
  );
};

export default FileDialog;
