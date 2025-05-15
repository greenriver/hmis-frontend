import { SvgIconComponent } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Button,
  ButtonProps,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuProps,
  Stack,
  Typography,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import { To } from 'react-router-dom';

import RouterLink from './RouterLink';
import { MoreMenuIcon } from './SemanticIcons';
import { LocationState } from '@/routes/routeUtil';

export type CommonMenuItem = {
  key: string;
  title: ReactNode;
  Icon?: SvgIconComponent;
  to?: To;
  onClick?: VoidFunction;
  divider?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  ariaLabel?: string;
  linkState?: LocationState;
  openInNew?: boolean;
};

interface Props {
  title: ReactNode;
  items: CommonMenuItem[];
  iconButton?: boolean; // use an icon button instead of a text button
  Icon?: SvgIconComponent;
  MenuProps?: Omit<MenuProps, 'open'>;
  ButtonProps?: ButtonProps;
}

const CommonMenuButton = ({
  title,
  items,
  iconButton,
  Icon,
  MenuProps,
  ButtonProps,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(null);
  };
  // pull out variant/color which can't be used for IconButton
  const { variant, color, ...buttonProps } = ButtonProps || {};

  const { MenuListProps, ...menuProps } = MenuProps || {};

  return (
    <>
      {iconButton ? (
        <IconButton
          id='menu-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          {...buttonProps}
        >
          {Icon ? (
            <Icon fontSize='inherit' />
          ) : (
            <MoreMenuIcon fontSize='inherit' />
          )}
        </IconButton>
      ) : (
        <Button
          id='menu-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          endIcon={<ArrowDropDownIcon />}
          variant={variant}
          color={color}
          {...buttonProps}
        >
          {title}
        </Button>
      )}

      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'menu-button',
          ...MenuListProps,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        // Bug: Opening the CommonMenu applies padding to the body, which can look weird on mobile.
        // It's sort of fixable with disableScrollLock, but that seems to introduce other scroll problems.
        // disableScrollLock={true}
        {...menuProps}
      >
        {items.map(
          ({
            key,
            to,
            title,
            Icon,
            divider,
            onClick,
            disabled,
            disabledReason,
            ariaLabel,
            openInNew,
            linkState,
          }) => {
            if (divider) return <Divider key={key} />;

            const props = {
              'aria-label': ariaLabel,
              disabled,
            };

            const menuItemLabel = (
              <Stack direction='row'>
                {Icon && (
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                )}
                <Stack direction='column'>
                  {title}
                  {disabled && disabledReason && (
                    // We often use tooltips to indicate the reason something is disabled,
                    // but in this case it's more difficult because the MenuItem must be the direct child of Menu
                    // (otherwise tab navigation doesn't work correctly).
                    // As a quick-fix, just put the disabled reason here below the label
                    <Typography
                      variant={'caption'}
                      sx={{ fontStyle: 'italic' }}
                    >
                      {disabledReason}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            );

            if (to) {
              return (
                <MenuItem
                  key={key}
                  {...props}
                  component={RouterLink}
                  to={to}
                  state={linkState}
                  openInNew={openInNew}
                  Icon={openInNew ? false : undefined} // use menu icon instead of link icon
                >
                  {menuItemLabel}
                </MenuItem>
              );
            }

            return (
              <MenuItem
                key={key}
                {...props}
                onClick={() => {
                  if (onClick) {
                    // close menu before triggering onClick
                    setAnchorEl(null);
                    onClick();
                  }
                }}
              >
                {menuItemLabel}
              </MenuItem>
            );
          }
        )}
      </Menu>
    </>
  );
};

export default CommonMenuButton;
