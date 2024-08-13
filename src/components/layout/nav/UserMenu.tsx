import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import ImpersonatedIcon from '@mui/icons-material/SupervisedUserCircle';
import {
  Alert,
  AlertTitle,
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
import React, { ReactNode, useMemo } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

const UserMenu: React.FC = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'userMenu' });
  const { user, logoutUser } = useAuth();
  const { manageAccountUrl, warehouseUrl, warehouseName } =
    useHmisAppSettings();
  const isMobile = useIsMobile();

  const menuItems = useMemo(() => {
    const items: ReactNode[] = [];
    if (!user || user.impersonating) return items;

    const sx = isMobile
      ? {
          py: 1,
          px: 3,
          border: '2px solid transparent',
        }
      : {};

    if (manageAccountUrl) {
      items.push(
        <MenuItem
          sx={sx}
          component={Link}
          href={manageAccountUrl}
          target='_blank'
          key='manage account'
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize='small' sx={{ color: 'links' }} />
          </ListItemIcon>
          <ListItemText>Manage Account</ListItemText>
        </MenuItem>
      );
    }
    if (warehouseUrl && warehouseName) {
      items.push(
        <MenuItem
          sx={sx}
          component={Link}
          href={warehouseUrl}
          target='_blank'
          key='warehouse'
        >
          <ListItemIcon>
            <OpenInNewIcon fontSize='small' sx={{ color: 'links' }} />
          </ListItemIcon>
          <ListItemText>{warehouseName}</ListItemText>
        </MenuItem>
      );
    }
    items.push(
      <MenuItem sx={sx} onClick={logoutUser} key='logout'>
        <ListItemIcon>
          <LogoutIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Sign Out</ListItemText>
      </MenuItem>
    );
    return items;
  }, [
    isMobile,
    logoutUser,
    manageAccountUrl,
    user,
    warehouseName,
    warehouseUrl,
  ]);

  if (!user) return null;

  if (user.impersonating) {
    return (
      <Alert
        severity='error'
        icon={false}
        action={
          <Button
            onClick={logoutUser}
            startIcon={<ExitToAppIcon />}
            size='small'
            color='error'
          >
            Exit
          </Button>
        }
        sx={{ height: '44px', py: '2px' }}
      >
        <AlertTitle sx={{ mb: 0 }}>{`Acting as ${user.name}`}</AlertTitle>
      </Alert>
    );
  }

  if (isMobile) {
    return menuItems;
  }

  return (
    <>
      <Button
        startIcon={
          user.impersonating ? <ImpersonatedIcon /> : <PersonPinIcon />
        }
        variant='text'
        sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
        id='userMenuToggle'
        {...bindTrigger(popupState)}
      >
        {user.name}
      </Button>
      <Menu
        anchorOrigin={{
          vertical: 48,
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{ sx: { borderTopLeftRadius: 0, borderTopRightRadius: 0 } }}
        {...bindMenu(popupState)}
      >
        {menuItems}
      </Menu>
    </>
  );
};

export default UserMenu;
