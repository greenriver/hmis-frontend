import { ListItemButton, ListItemText } from '@mui/material';
import React from 'react';
import RouterLink from '@/components/elements/RouterLink';

interface Props {
  title: string;
  selected: boolean;
  path?: string;
}

const MobileMenuItem: React.FC<Props> = ({ title, selected, path }) => {
  return (
    <ListItemButton component={RouterLink} to={path} selected={selected}>
      <ListItemText primary={title} />
    </ListItemButton>
  );
};
export default MobileMenuItem;
