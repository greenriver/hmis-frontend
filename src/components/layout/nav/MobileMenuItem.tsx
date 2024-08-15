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
    <ListItemButton
      component={RouterLink}
      to={path}
      selected={selected}
      sx={{
        py: 1,
        '&.Mui-selected': {
          // matches styling in `ItemBase` which is used for desktop nav menu items
          color: 'primary.main',
          fontWeight: 600,
        },
      }}
    >
      <ListItemText primary={title} disableTypography />
    </ListItemButton>
  );
};
export default MobileMenuItem;
