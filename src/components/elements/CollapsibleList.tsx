import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import React, { ReactNode, useState } from 'react';

interface Props {
  title: ReactNode;
  children: ReactNode;
}
const CollapsibleList: React.FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <List sx={{ p: 0 }}>
      <ListItemButton onClick={handleClick}>
        {open ? <ExpandLess /> : <ExpandMore />}
        <ListItemText sx={{ ml: 2 }} primary={title} />
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <List component='div' disablePadding>
          {children}
        </List>
      </Collapse>
    </List>
  );
};

export default CollapsibleList;
