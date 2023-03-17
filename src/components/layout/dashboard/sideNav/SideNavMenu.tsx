import { Box } from '@mui/material';

import Category from './ItemCategory';
import { NavItem } from './types';

interface SideNavMenuProps {
  items: NavItem[];
}

const SideNavMenu = ({ items }: SideNavMenuProps) => {
  return (
    <Box>
      {items.map((item, index) => (
        <Category key={item.id} item={item} first={index === 0} />
      ))}
    </Box>
  );
};

export default SideNavMenu;
