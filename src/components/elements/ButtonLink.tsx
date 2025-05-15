import { SvgIconComponent } from '@mui/icons-material';
import { Button, ButtonProps } from '@mui/material';
import { forwardRef, Ref } from 'react';
import { Link, LinkProps } from 'react-router-dom';

export type ButtonLinkProps = Omit<
  ButtonProps,
  'href' | `on${string}` | 'component' | 'role' | 'ref'
> &
  LinkProps & {
    leftAlign?: boolean;
    Icon?: SvgIconComponent;
    openInNew?: boolean;
    ariaLabel?: string;
  };

/**
 * A `ButtonLink` is a React-Router link that looks like a button. The underlying interactive element is an `a` tag.
 */
const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    { sx, leftAlign, Icon, openInNew, ...props },
    ref: Ref<HTMLAnchorElement>
  ) {
    return (
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
    );
  }
);

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
