import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  SxProps,
} from '@mui/material';
import { Theme } from '@mui/system';
import React, { ReactNode, useEffect, useState } from 'react';

export interface CollapsibleListProps {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  sx?: SxProps<Theme>;
}

const CollapsibleList: React.FC<CollapsibleListProps> = ({
  title,
  children,
  open: initialOpen = false,
  sx,
}) => {
  const [open, setOpen] = useState(initialOpen);

  // allow prop to change state, needed for ContextualCollapsibleList
  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <List sx={{ p: 0, ...sx }} disablePadding>
      <ListItemButton
        onClick={handleClick}
        sx={{ color: (theme) => theme.palette.links }}
      >
        {open ? <ExpandLess /> : <ExpandMore />}
        <ListItemText
          sx={{ ml: 1 }}
          primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
          primary={title}
        />
      </ListItemButton>
      <Collapse in={open} timeout='auto' unmountOnExit>
        <List
          component='div'
          disablePadding
          sx={{ pl: 4, '.MuiListItem-root': { pb: 1 } }}
          dense
        >
          {children}
        </List>
      </Collapse>
    </List>
  );
};

export default CollapsibleList;
