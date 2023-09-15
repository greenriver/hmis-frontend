import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonPinIcon from '@mui/icons-material/PersonPin';
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
import React from 'react';

import useAuth from '@/modules/auth/hooks/useAuth';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const UserMenu: React.FC = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'userMenu' });
  const { user, logoutUser } = useAuth();
  const { manageAccountUrl } = useHmisAppSettings();

  if (!user) return null;

  return (
    <>
      <Button
        startIcon={<PersonPinIcon />}
        variant='text'
        sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
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
