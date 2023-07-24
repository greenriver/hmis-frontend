import { Button, ButtonProps } from '@mui/material';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

export type ButtonLinkProps = Omit<ButtonProps, 'href'> &
  LinkProps & { leftAlign?: boolean; Icon?: React.ComponentType };

const ButtonLink = forwardRef<ButtonLinkProps, any>(
  ({ sx, leftAlign, Icon, ...props }, ref) => (
    <Button
      variant='outlined'
      color='primary'
      sx={{ ...(leftAlign ? { pl: 3, justifyContent: 'left' } : {}), ...sx }}
      startIcon={Icon ? <Icon fontSize='small' /> : undefined}
      component={Link}
      ref={ref}
      {...props}
      role={undefined} // remove the button role
    />
  )
);

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
