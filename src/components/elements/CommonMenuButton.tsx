import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Button, Divider, Menu, MenuItem } from '@mui/material';
import { ReactNode, useState } from 'react';
import { To } from 'react-router-dom';

import RouterLink from './RouterLink';

export type NavMenuItem = {
  key: string;
  to?: To;
  title?: ReactNode;
  divider?: boolean;
};

interface Props {
  title: ReactNode;
  items: NavMenuItem[];
}

const CommonMenuButton = ({ title, items }: Props) => {
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
        {items.map(({ key, to, title, divider }) =>
          divider ? (
            <Divider key={key} />
          ) : (
            <MenuItem key={key}>
              <RouterLink to={to} plain>
                {title}
              </RouterLink>
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
};

export default CommonMenuButton;
