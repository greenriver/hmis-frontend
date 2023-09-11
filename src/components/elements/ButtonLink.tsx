import { Button, ButtonProps } from '@mui/material';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

export type ButtonLinkProps = Omit<ButtonProps, 'href'> &
  LinkProps & {
    leftAlign?: boolean;
    Icon?: React.ComponentType;
    openInNew?: boolean;
  };

const ButtonLink = forwardRef<ButtonLinkProps, any>(
  ({ sx, leftAlign, Icon, openInNew, ...props }, ref) => (
    <Button
      variant='outlined'
      color='primary'
      sx={{ ...(leftAlign ? { pl: 3, justifyContent: 'left' } : {}), ...sx }}
      startIcon={Icon ? <Icon fontSize='small' /> : undefined}
      component={Link}
      ref={ref}
      target={openInNew ? '_blank' : undefined}
      rel={openInNew ? 'noopener' : undefined}
      replace={openInNew ? true : undefined}
      {...props}
      role={undefined} // remove the button role
    />
  )
);

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
