import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { NavItem } from './types';
import { addTrailingSlash } from '@/components/layout/dashboard/sideNav/navUtil';
import useCurrentPath from '@/hooks/useCurrentPath';

export type Options<T> = {
  item: NavItem<T>;
};

export const useItemSelectionStatus = <T extends object>({
  item,
}: Options<T>) => {
  const { pathname: currentLocation } = useLocation(); // /projects/1/foo
  const currentPath = useCurrentPath(); // /projects/:id/foo

  const isSelected = useMemo(() => {
    if (item.path) {
      const matchesPath =
        currentLocation === item.path || // matches path exactly
        currentLocation.startsWith(addTrailingSlash(item.path)); // starts with path

      if (matchesPath) return true;
    }

    // If current route is listed in this item's activePaths, then this nav item should be selected.
    if (item.activePaths) {
      return item.activePaths.some((p) => p === currentPath);
    }

    return false;
  }, [item.path, item.activePaths, currentLocation, currentPath]);

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
