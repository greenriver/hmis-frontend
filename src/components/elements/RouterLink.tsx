import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link, LinkProps, Stack } from '@mui/material';
import { forwardRef } from 'react';
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from 'react-router-dom';
export type RouterLinkProps = Omit<LinkProps, 'href'> &
  ReactRouterLinkProps & { plain?: boolean; openInNew?: boolean };

const RouterLink = forwardRef<RouterLinkProps, any>(
  ({ plain, openInNew = false, children, ...props }, ref) => (
    <Link
      component={ReactRouterLink}
      ref={ref}
      underline={plain ? 'none' : undefined}
      {...props}
      sx={plain ? { color: 'inherit', ...props.sx } : props.sx}
      target={openInNew ? '_blank' : undefined}
    >
      {openInNew ? (
        <Stack direction={'row'} gap={0.75} alignItems='center'>
          {children}
          <OpenInNewIcon fontSize='inherit' />
        </Stack>
      ) : (
        children
      )}
    </Link>
  )
);

RouterLink.displayName = 'RouterLink';

export default RouterLink;
