import { Link, LinkProps } from '@mui/material';
import { forwardRef } from 'react';
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from 'react-router-dom';

type RouterLinkProps = Omit<LinkProps, 'href'> & ReactRouterLinkProps;

const RouterLink = forwardRef<RouterLinkProps, any>((props, ref) => (
  <Link component={ReactRouterLink} ref={ref} {...props} />
));

RouterLink.displayName = 'RouterLink';

export default RouterLink;
