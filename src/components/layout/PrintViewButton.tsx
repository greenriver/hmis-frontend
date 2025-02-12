import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import PrintIcon from '@mui/icons-material/Print';
import { Button } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { To, useLocation } from 'react-router-dom';
import ButtonLink, { ButtonLinkProps } from '../elements/ButtonLink';

export interface PrintViewButtonProps
  extends Omit<ButtonLinkProps, 'to' | 'ref' | `on${string}`> {
  exit?: boolean;
  to?: To;
  openInNew?: boolean;
}

const PrintViewButton: React.FC<PrintViewButtonProps> = ({
  exit = false,
  children = exit ? 'Exit Print View' : 'Open Print View',
  to,
  openInNew,
  ...props
}) => {
  const location = useLocation();

  const backlinkUrl: To = useMemo(() => {
    if (to && !exit) return `${to}?print`;
    const params = new URLSearchParams(location.search);
    if (exit) {
      params.delete('print');
    } else {
      params.append('print', '');
    }
    return [location.pathname, params.toString()].join('?');
  }, [location, exit, to]);

  const closeTab = useCallback(() => {
    window.opener = null;
    window.open('', '_self');
    window.close();
  }, []);

  // If we have no location history, that means the print
  // view was opened in a fresh tab. In that case, the close
  // action is closing the window.
  if (exit && location.key === 'default') {
    return (
      <Button
        onClick={closeTab}
        startIcon={<CancelPresentationIcon />}
        variant='outlined'
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <ButtonLink
      startIcon={exit ? <CancelPresentationIcon /> : <PrintIcon />}
      variant='outlined'
      {...props}
      to={backlinkUrl}
      openInNew={openInNew}
    >
      {children}
    </ButtonLink>
  );
};

export default PrintViewButton;
