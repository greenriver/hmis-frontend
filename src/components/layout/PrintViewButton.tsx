import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import PrintIcon from '@mui/icons-material/Print';
import { Button, ButtonProps } from '@mui/material';
import React, { useMemo } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';

export interface PrintViewButtonProps
  extends Omit<
    ButtonProps<typeof RouterLink, { component?: typeof RouterLink }>,
    'to'
  > {
  exit?: boolean;
}

const PrintViewButton: React.FC<PrintViewButtonProps> = ({
  exit = false,
  children = exit ? 'Exit Print View' : 'Goto Print View',
  ...props
}) => {
  const location = useLocation();

  const backlinkUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (exit) {
      params.delete('print');
    } else {
      params.append('print', '');
    }
    return [location.pathname, params.toString()].join('?');
  }, [location, exit]);

  return (
    <Button
      startIcon={exit ? <CancelPresentationIcon /> : <PrintIcon />}
      variant='outlined'
      {...props}
      component={RouterLink}
      to={backlinkUrl}
    >
      {children}
    </Button>
  );
};

export default PrintViewButton;
