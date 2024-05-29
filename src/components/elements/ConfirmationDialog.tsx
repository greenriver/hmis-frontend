import Button, { ButtonProps } from '@mui/material/Button';
import { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Stack } from '@mui/system';
import * as React from 'react';

import CommonDialog from './CommonDialog';

import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import {
  ErrorRenderFn,
  ErrorState,
  hasAnyValue,
  hasErrors,
  hasOnlyWarnings,
} from '@/modules/errors/util';

export interface ConfirmationDialogProps extends DialogProps {
  loading: boolean;
  children: React.ReactNode;
  confirmText?: React.ReactNode;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: VoidFunction;
  color?: ButtonProps['color'];
  errorState?: ErrorState;
  hideCancelButton?: boolean;
  renderError?: ErrorRenderFn;
  cancelText?: string;
}

const ConfirmationDialog = ({
  onConfirm,
  onCancel,
  title,
  children,
  loading,
  confirmText = 'Confirm',
  cancelText,
  color,
  errorState,
  hideCancelButton,
  renderError,
  ...other
}: ConfirmationDialogProps) => {
  const unconfirmable =
    errorState && (hasErrors(errorState) || errorState.apolloError);

  return (
    <CommonDialog keepMounted={false} onClose={onCancel} {...other}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {children}
        {errorState && hasAnyValue(errorState) && (
          <Stack gap={1} sx={{ mt: children ? 3 : undefined }}>
            <ApolloErrorAlert error={errorState.apolloError} />
            <ErrorAlert key='errors' errors={errorState.errors} />
            {hasOnlyWarnings(errorState) && (
              <WarningAlert key='warnings' warnings={errorState.warnings} />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Stack gap={3} direction='row'>
          {!hideCancelButton && (
            <Button
              onClick={onCancel}
              variant='gray'
              data-testid='cancelDialogAction'
            >
              {cancelText || (unconfirmable ? 'Close' : 'Cancel')}
            </Button>
          )}
          {!unconfirmable && (
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
          )}
        </Stack>
      </DialogActions>
    </CommonDialog>
  );
};

export default ConfirmationDialog;
