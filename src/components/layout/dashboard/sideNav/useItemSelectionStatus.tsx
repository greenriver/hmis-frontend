import { escapeRegExp } from 'lodash-es';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { NavItem } from './types';
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
    if (!item.path && !item.activePaths) return false;
    // If current location matches item path, then this nav item should be selected.
    // (e.g. item path is /enrollments/1/services and current location is /enrollments/1/services/2)
    // Use a regex to avoid false positives (e.g. item path is /projects/1/ce and current location is /projects/1/ce-participation)
    const escapedPath = item.path ? escapeRegExp(item.path) : '';
    const regex = new RegExp(`^${escapedPath}(?:[#/\?]|$)`);
    if (item.path && regex.test(currentLocation)) {
      return true;
    }

    // If current route is listed in this item's activePaths, then this nav item should be selected.
    if (item.activePaths && item.activePaths.some((p) => p === currentPath)) {
      return true;
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
