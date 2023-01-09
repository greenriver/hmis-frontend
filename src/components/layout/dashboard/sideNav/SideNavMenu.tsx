import { Box } from '@mui/material';
import React from 'react';

import Category from './ItemCategory';

export interface NavItem {
  id: string;
  title?: React.ReactNode;
  icon?: React.ReactElement;
  items?: NavItem[];
  href?: string;
  path?: string;
  type?: 'topic' | 'category' | 'section';
}

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
