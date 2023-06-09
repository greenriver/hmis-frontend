import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogProps, IconButton } from '@mui/material';

const CommonDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      {children}
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
