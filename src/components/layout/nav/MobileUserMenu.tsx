import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemButton, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import UserMenu from '@/components/layout/nav/UserMenu';

const MobileUserMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton onClick={() => setOpen((v) => !v)} divider={open}>
        <ListItemText primary='User' />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <UserMenu />
      </Collapse>
    </>
  );
};
export default MobileUserMenu;
