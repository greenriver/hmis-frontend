import { Box } from '@mui/material';

import { useMemo } from 'react';
import ItemCategory from './ItemCategory';
import { applySafePaths, filterByAccess } from './navUtil';
import { NavItem } from './types';

interface SideNavMenuProps<T> {
  items: NavItem<T>[];
  access?: T;
  pathParams?: Record<string, string>;
}

const SideNavMenu = <T extends object>({
  items,
  access,
  pathParams,
}: SideNavMenuProps<T>) => {
  const itemsFilteredForAccess = useMemo(() => {
    let modifiedItems = items;
    if (pathParams) {
      modifiedItems = applySafePaths(items, pathParams);
    }
    if (access) {
      modifiedItems = filterByAccess(modifiedItems, access);
    }
    return modifiedItems;
  }, [access, items, pathParams]);

  return (
    <Box sx={{ pt: 2 }}>
      {itemsFilteredForAccess.map((item, index) => (
        <ItemCategory key={item.id} item={item} first={index === 0} />
      ))}
    </Box>
  );
};

export default SideNavMenu;
