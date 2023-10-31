import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { NavItem } from './types';

export type Options = {
  item: NavItem;
};

export const useItemSelectionStatus = ({ item }: Options) => {
  const { pathname } = useLocation();

  const isSelected = useMemo(() => {
    if (!item.path) return false;

    return item.path && pathname.startsWith(item.path);
  }, [pathname, item]);

  const childItems = useMemo(() => {
    if (!item.items) return [];
    return item.items.filter((i) => !i.hide);
  }, [item.items]);

  return useMemo(
    () => ({
      isSelected: !!isSelected,
      childItems,
      hasChildItems: childItems.length > 0,
    }),
    [childItems, isSelected]
  );
};
