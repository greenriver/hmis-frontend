import { Link, LinkProps } from '@mui/material';
import { forwardRef } from 'react';
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from 'react-router-dom';

export type RouterLinkProps = Omit<LinkProps, 'href'> &
  ReactRouterLinkProps & { plain?: boolean };

const RouterLink = forwardRef<RouterLinkProps, any>(
  ({ plain, ...props }, ref) => (
    <Link
      component={ReactRouterLink}
      ref={ref}
      underline={plain ? 'none' : undefined}
      {...props}
      sx={plain ? { color: 'inherit', ...props.sx } : props.sx}
    />
  )
);

RouterLink.displayName = 'RouterLink';

export default RouterLink;
