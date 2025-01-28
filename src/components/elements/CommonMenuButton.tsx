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
  MenuProps?: Omit<MenuProps, 'open'>;
  ButtonProps?: ButtonProps;
  preMenuComponent?: ReactNode;
}

const CommonMenuButton = ({
  title,
  items,
  iconButton,
  MenuProps,
  ButtonProps,
  preMenuComponent,
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
          <MoreMenuIcon fontSize='inherit' />
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
        {...MenuProps}
      >
        {preMenuComponent}
        {items.map(
          ({
            key,
            to,
            title,
            Icon,
            divider,
            onClick,
            disabled,
            ariaLabel,
            openInNew,
          }) =>
            divider ? (
              <Divider key={key} />
            ) : to ? (
              <MenuItem
                key={key}
                component={RouterLink}
                to={to}
                aria-label={ariaLabel}
                openInNew={openInNew}
              >
                {Icon && (
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                )}
                {title}
              </MenuItem>
            ) : (
              <MenuItem
                key={key}
                onClick={() => {
                  if (onClick) {
                    // close menu before triggering onClick
                    setAnchorEl(null);
                    onClick();
                  }
                }}
                disabled={disabled}
                aria-label={ariaLabel}
              >
                {Icon && (
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                )}
                {title}
              </MenuItem>
            )
        )}
      </Menu>
    </>
  );
};

export default CommonMenuButton;
