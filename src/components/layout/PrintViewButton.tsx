import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import PrintIcon from '@mui/icons-material/Print';
import { Button, ButtonProps } from '@mui/material';
import React, { useMemo } from 'react';
import { useLocation, Link as RouterLink, To } from 'react-router-dom';

export interface PrintViewButtonProps
  extends Omit<
    ButtonProps<typeof RouterLink, { component?: typeof RouterLink }>,
    'to'
  > {
  exit?: boolean;
  to?: To;
  openInNew?: boolean;
}

const PrintViewButton: React.FC<PrintViewButtonProps> = ({
  exit = false,
  children = exit ? 'Exit Print View' : 'Goto Print View',
  to,
  openInNew,
  ...props
}) => {
  const location = useLocation();

  const backlinkUrl = useMemo(() => {
    if (to && !exit) return `${to}?print`;
    const params = new URLSearchParams(location.search);
    if (exit) {
      params.delete('print');
    } else {
      params.append('print', '');
    }
    return [location.pathname, params.toString()].join('?');
  }, [location, exit, to]);

  return (
    <Button
      startIcon={exit ? <CancelPresentationIcon /> : <PrintIcon />}
      variant='outlined'
      {...props}
      component={RouterLink}
      to={backlinkUrl}
      target={openInNew ? '_blank' : undefined}
    >
      {children}
    </Button>
  );
};

export default PrintViewButton;
