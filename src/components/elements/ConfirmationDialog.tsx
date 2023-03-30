import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/system';
import * as React from 'react';

import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import { ErrorState, hasAnyValue } from '@/modules/errors/types';

export interface ConfirmationDialogProps extends DialogProps {
  loading: boolean;
  children: React.ReactNode;
  confirmText?: string;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
  onCancel: () => void;
  color?: ButtonProps['color'];
  errors?: ErrorState;
}

const ConfirmationDialog = ({
  onConfirm,
  onCancel,
  title,
  children,
  loading,
  confirmText = 'Confirm',
  color,
  errors,
  ...other
}: ConfirmationDialogProps) => {
  return (
    <Dialog keepMounted={false} {...other}>
      <DialogTitle
        sx={{
          py: 3,
          '&.MuiDialogTitle-root': {
            textTransform: 'unset',
            color: 'text.primary',
            fontSize: 20,
            fontWeight: 600,
          },
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        {children}
        {errors && hasAnyValue(errors) && (
          <Stack gap={1} sx={{ mt: 4 }}>
            <ApolloErrorAlert error={errors.apolloError} />
            <ErrorAlert key='errors' errors={errors.errors} fixable={false} />
            <WarningAlert key='warnings' warnings={errors.warnings} />
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 2,
          // justifyContent: 'center',
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: 'borders.light',
        }}
      >
        <Stack gap={3} direction='row'>
          <Button
            onClick={onCancel}
            variant='gray'
            data-testid='cancelDialogAction'
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={onConfirm}
            type='submit'
            loading={loading}
            data-testid='confirmDialogAction'
            sx={{ minWidth: '120px' }}
            color={color}
          >
            {confirmText}
          </LoadingButton>
        </Stack>
      </DialogActions>
      <IconButton
        aria-label='close'
        onClick={onCancel}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </Dialog>
  );
};

export default ConfirmationDialog;
