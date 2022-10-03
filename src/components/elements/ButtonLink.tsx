import { Button, ButtonProps } from '@mui/material';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

type ButtonLinkProps = Omit<ButtonProps, 'href'> & LinkProps;

const ButtonLink = forwardRef<ButtonLinkProps, any>((props, ref) => (
  <Button
    component={Link}
    ref={ref}
    {...props}
    role={undefined} // remove the button role
  />
));

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
