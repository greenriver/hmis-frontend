import { Snackbar, SnackbarProps } from '@mui/material';

interface CommonSnackbarProps extends SnackbarProps {}

const CommonSnackbar: React.FC<CommonSnackbarProps> = ({
  children,
  onClose,
  open,
  ...props
}) => (
  <Snackbar
    TransitionProps={{ appear: false }}
    open={open}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    {...props}
    sx={{ marginTop: '100px', ...props.sx }}
  >
    {children}
  </Snackbar>
);

export default CommonSnackbar;
