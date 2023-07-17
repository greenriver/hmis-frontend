import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Button,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  bindMenu,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';
import React, { useCallback } from 'react';

import { logout } from '@/modules/auth/api/sessions';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const UserMenu: React.FC = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'userMenu' });
  const { user } = useAuth();
  const { manageAccountUrl } = useHmisAppSettings();

  const logoutUser = useCallback(() => {
    return logout().then(() => (window.location.href = '/'));
  }, []);

  if (!user) return null;

  return (
    <>
      <Button
        startIcon={<AccountCircleIcon />}
        variant='text'
        sx={{ fontSize: '1rem', color: 'text.primary' }}
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
        {manageAccountUrl && (
          <MenuItem component={Link} href={manageAccountUrl} target='_blank'>
            <ListItemIcon>
              <OpenInNewIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Manage Account</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={logoutUser}>
          <ListItemIcon>
            <LogoutIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
