import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogProps, IconButton } from '@mui/material';
import { useCallback } from 'react';

import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';

interface Props extends DialogProps {
  enableBackdropClick?: boolean;
}

const CommonDialog: React.FC<Props> = ({
  children,
  onClose,
  enableBackdropClick = false,
  ...props
}) => {
  const handleClose = useCallback<Required<DialogProps>['onClose']>(
    (evt, reason) => {
      if (enableBackdropClick && onClose) {
        return onClose(evt, reason);
      }
      if (reason !== 'backdropClick' && onClose) {
        onClose(evt, reason);
      }
    },
    [onClose, enableBackdropClick]
  );

  return (
    <Dialog
      data-testid='dialog'
      {...props}
      onClose={handleClose}
      sx={{ '.MuiDialogTitle-root': { mr: 2 }, ...props.sx }}
    >
      <SentryErrorBoundary>{children}</SentryErrorBoundary>
      {onClose && (
        <IconButton
          aria-label='close'
          onClick={onClose ? (e) => onClose(e, 'backdropClick') : undefined}
          onKeyDown={(event) => {
            // Hack: don't close dialog on keydown for Enter, because it will re-open
            // the selected row onKeyUp if this dialog is coming from a row click.
            // The Dialog can be closed with 'esc' or with hitting space while the exit icon is selected
            // FIXME: fix this in a better way
            if (event.key === 'Enter') {
              event.stopPropagation();
              event.preventDefault();
            }
          }}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Dialog>
  );
};

export default CommonDialog;
