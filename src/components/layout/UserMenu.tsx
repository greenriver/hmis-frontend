import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Link,
} from '@mui/material';
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks';
import React, { useCallback } from 'react';

import useAuth from '@/modules/auth/hooks/useAuth';
import getManageAccountLink from '@/modules/auth/utils/getManageAccountLink';

const UserMenu: React.FC = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'userMenu' });
  const { logout, user } = useAuth();
  const logoutUser = useCallback(() => logout(true), [logout]);

  if (!user) return null;

  return (
    <>
      <Button
        startIcon={<AccountCircleIcon />}
        variant='text'
        color='secondary'
        {...bindTrigger(popupState)}
      >
        {user.name}
      </Button>
      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        {...bindMenu(popupState)}
      >
        <MenuItem component={Link} href={getManageAccountLink()} target='_blank'>
          <ListItemIcon>
            <OpenInNewIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Manage Account</ListItemText>
        </MenuItem>
        <MenuItem onClick={logoutUser}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
