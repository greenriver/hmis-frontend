import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import React, { ReactNode, useState } from 'react';

interface Props {
  title: ReactNode;
  children: ReactNode;
}

// collapsible list that can be used in a table cell
// use for expandable details such as audit history change details

const CollapsibleList: React.FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

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
          sx={{ '.MuiListItem-root': { pl: 6 } }}
          dense
        >
          {children}
        </List>
      </Collapse>
    </List>
  );
};

export default CollapsibleList;
