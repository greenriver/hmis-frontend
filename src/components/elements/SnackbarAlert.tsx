import { Alert, AlertProps, AlertTitle, Snackbar } from '@mui/material';

import { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  children?: ReactNode;
  alertProps?: AlertProps;
  title?: string;
}
const SnackbarAlert: React.FC<Props> = ({
  open,
  onClose,
  children,
  alertProps,
  title,
}) => {
  return (
    <Snackbar
      TransitionProps={{ appear: false }} // transition looks kind of junky
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={({ shadows }) => ({
        boxShadow: shadows[6],
        borderRadius: 2, // matches Alert
        '.MuiAlertTitle-root': { fontWeight: 600 },
        marginTop: '100px',
      })}
    >
      <Alert onClose={onClose} {...alertProps}>
        {title && <AlertTitle sx={{ mb: 0 }}>{title}</AlertTitle>}
        {children}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;
