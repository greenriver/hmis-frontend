import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';

export interface CollapsibleListProps {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
}

const CollapsibleList: React.FC<CollapsibleListProps> = ({
  title,
  children,
  open: initialOpen = false,
}) => {
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <List sx={{ p: 0 }} disablePadding>
      <ListItemButton
        onClick={handleClick}
        sx={{ color: (theme) => theme.palette.links }}
      >
        {open ? <ExpandLess /> : <ExpandMore />}
        <ListItemText
          sx={{ ml: 1 }}
          primaryTypographyProps={{ fontWeight: 600 }}
          primary={title}
        />
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <List
          component='div'
          disablePadding
          sx={{ '.MuiListItem-root': { pl: 6, pb: 1 } }}
          dense
        >
          {children}
        </List>
      </Collapse>
    </List>
  );
};

export default CollapsibleList;
