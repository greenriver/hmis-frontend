import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Button,
  ButtonProps,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  MenuProps,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import { To } from 'react-router-dom';

import RouterLink from './RouterLink';
import { MoreMenuIcon } from './SemanticIcons';

export type NavMenuItem = {
  key: string;
  to?: To;
  onClick?: VoidFunction;
  title?: ReactNode;
  divider?: boolean;
  disabled?: boolean;
};

interface Props {
  title: ReactNode;
  items: NavMenuItem[];
  variant?: ButtonProps['variant'];
  disabled?: ButtonProps['disabled'];
  iconButton?: boolean; // use an icon button instead of a text button
  sx?: ButtonProps['sx'];
  MenuProps?: Omit<MenuProps, 'open'>;
}

const CommonMenuButton = ({
  title,
  items,
  iconButton,
  MenuProps,
  ...buttonProps
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
        {...MenuProps}
      >
        {items.map(({ key, to, title, divider, onClick, disabled }) =>
          divider ? (
            <Divider key={key} />
          ) : to ? (
            <MenuItem key={key} component={RouterLink} to={to}>
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
            >
              {title}
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};

export default CommonMenuButton;
