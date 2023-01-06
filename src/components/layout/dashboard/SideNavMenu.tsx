import { Box } from '@mui/material';
import React from 'react';

import Category from './sideNav/Category';

export interface NavItem {
  id: string;
  title?: React.ReactNode;
  icon?: React.ReactElement;
  items?: NavItem[];
  href?: string;
  path?: string;
  type?: 'topic' | 'category' | 'section';
}

export interface SideNavMenuProps {
  items: NavItem[];
}

export const getHtmlIdForItem = (navItem: NavItem) => `nav_${navItem.id}`;

export const SideNavMenu: React.FC<SideNavMenuProps> = ({ items }) => {
  return (
    <Box>
      {items.map((item, index) => (
        <Category key={item.id} item={item} first={index === 0} />
      ))}
    </Box>
  );
};
