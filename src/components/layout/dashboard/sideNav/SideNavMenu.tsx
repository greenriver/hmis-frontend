import { Box } from '@mui/material';

import ItemCategory from './ItemCategory';
import { NavItem } from './types';

interface SideNavMenuProps {
  items: NavItem[];
}

const SideNavMenu = ({ items }: SideNavMenuProps) => {
  return (
    <Box sx={{ pt: 2 }}>
      {items.map((item, index) => (
        <ItemCategory key={item.id} item={item} first={index === 0} />
      ))}
    </Box>
  );
};

export default SideNavMenu;
