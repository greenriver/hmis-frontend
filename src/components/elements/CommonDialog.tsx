import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogProps, IconButton } from '@mui/material';

import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';

const CommonDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props} sx={{ '.MuiDialogTitle-root': { mr: 2 }, ...props.sx }}>
      <SentryErrorBoundary>{children}</SentryErrorBoundary>
      {props.onClose && (
        <IconButton
          aria-label='close'
          onClick={(e) => props.onClose && props.onClose(e, 'backdropClick')}
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
