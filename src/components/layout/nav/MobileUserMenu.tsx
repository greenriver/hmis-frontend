import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemButton, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import UserMenu from '@/components/layout/nav/UserMenu';

const MobileUserMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <ListItemButton onClick={() => setOpen((v) => !v)} divider={open}>
        <ListItemText primary='My Account' />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <UserMenu />
      </Collapse>
    </li>
  );
};
export default MobileUserMenu;
