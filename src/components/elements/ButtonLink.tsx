import { Button, ButtonProps } from '@mui/material';
import { forwardRef } from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';

type ButtonLinkProps = Omit<ButtonProps, 'href'> & RouterLinkProps;

const ButtonLink = forwardRef<ButtonLinkProps, any>((props, ref) => (
  <Button
    component={RouterLink}
    ref={ref}
    {...props}
    role={undefined} // remove the button role
  />
));

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
