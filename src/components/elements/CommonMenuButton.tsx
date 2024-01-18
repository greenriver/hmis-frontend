import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, ButtonProps, Divider, Menu, MenuItem } from '@mui/material';
import { ReactNode, useState } from 'react';
import { To } from 'react-router-dom';

import RouterLink from './RouterLink';

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
}

const CommonMenuButton = ({ title, items, ...buttonProps }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
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
      >
        {items.map(({ key, to, title, divider, onClick, disabled }) =>
          divider ? (
            <Divider key={key} />
          ) : to ? (
            <MenuItem key={key} component={RouterLink} to={to}>
              {title}
            </MenuItem>
          ) : (
            <MenuItem key={key} onClick={onClick} disabled={disabled}>
              {title}
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};

export default CommonMenuButton;
