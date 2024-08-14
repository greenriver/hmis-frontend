import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemButton, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import UserMenu from '@/components/layout/nav/UserMenu';
import useAuth from '@/modules/auth/hooks/useAuth';

const MobileUserMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <li>
      <ListItemButton onClick={() => setOpen((v) => !v)} divider={open}>
        <ListItemText primary={user?.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <UserMenu />
      </Collapse>
    </li>
  );
};
export default MobileUserMenu;
