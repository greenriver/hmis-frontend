import { Alert, AlertProps, AlertTitle } from '@mui/material';

import { ReactNode } from 'react';
import CommonSnackbar from '@/components/elements/CommonSnackbar';

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
    <CommonSnackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        '.MuiAlertTitle-root': { fontWeight: 600 },
      }}
    >
      <Alert onClose={onClose} {...alertProps}>
        {title && <AlertTitle sx={{ mb: 0 }}>{title}</AlertTitle>}
        {children}
      </Alert>
    </CommonSnackbar>
  );
};

export default SnackbarAlert;
