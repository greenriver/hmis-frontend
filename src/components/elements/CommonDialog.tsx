import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogProps, IconButton } from '@mui/material';

import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';

const CommonDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog
      data-testid='dialog'
      {...props}
      sx={{ '.MuiDialogTitle-root': { mr: 2 }, ...props.sx }}
    >
      <SentryErrorBoundary>{children}</SentryErrorBoundary>
      {props.onClose && (
        <IconButton
          aria-label='close'
          onClick={(e) => props.onClose && props.onClose(e, 'backdropClick')}
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
