import { SvgIconComponent } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link, LinkProps, Stack } from '@mui/material';
import { forwardRef, Ref } from 'react';
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from 'react-router-dom';

export type RouterLinkProps = Omit<LinkProps, 'href'> &
  ReactRouterLinkProps & {
    plain?: boolean;
    openInNew?: boolean;
    Icon?: SvgIconComponent;
  };

const RouterLink = forwardRef<HTMLLinkElement, RouterLinkProps>(
  function RouterLink(
    { plain, openInNew = false, children, Icon, ...props }: RouterLinkProps,
    ref: Ref<HTMLLinkElement>
  ) {
    return (
      <Link
        component={ReactRouterLink}
        ref={ref}
        underline={plain ? 'none' : undefined}
        variant='inherit'
        {...props}
        sx={plain ? { color: 'inherit', ...props.sx } : props.sx}
        target={openInNew ? '_blank' : undefined}
      >
        {openInNew || Icon ? (
          <Stack
            direction={'row'}
            gap={0.75}
            alignItems='center'
            sx={{ display: 'inline-flex', textDecoration: 'inherit' }}
            component='span'
          >
            {children}
            {openInNew ? (
              <OpenInNewIcon fontSize='inherit' />
            ) : (
              Icon && <Icon fontSize='inherit' />
            )}
          </Stack>
        ) : (
          children
        )}
      </Link>
    );
  }
);

RouterLink.displayName = 'RouterLink';

export default RouterLink;
