import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { NavItem } from './SideNavMenu';

export type Options = {
  item: NavItem;
};

export const useItemSelectionStatus = ({ item }: Options) => {
  const { pathname } = useLocation();

  const isSelected = useMemo(() => {
    if (!item.path) return false;

    return item.path && pathname.startsWith(item.path);
  }, [pathname, item]);

  return useMemo(
    () => ({
      hasItems: !!item.items,
      isSelected: !!isSelected,
    }),
    [item, isSelected]
  );
};
