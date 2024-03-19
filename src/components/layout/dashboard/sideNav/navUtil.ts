import { NavItem } from './types';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Whether or not a user can access the given page item
 */
const canAccessNavItem = <T>(page: NavItem<T>, access: T): boolean => {
  if (!page.permissions) return true;
  if (page.permissions.length === 0) return true;

  if (page.permissionMode === 'any') {
    return page.permissions.some((perm) => access[perm]);
  }

  return page.permissions.every((perm) => access[perm]);
};

/**
 * Recursively filter out any nav items that the user does not have access to
 */
export const filterByAccess = <T>(
  config: NavItem<T>[],
  access: T
): NavItem<T>[] => {
  function recur(item: NavItem<T>): NavItem<T> {
    const { items, ...rest } = item;
    if (!items) return item;
    const filtered = items
      .filter((child) => canAccessNavItem(child, access))
      .map((child) => recur(child));

    return { ...rest, items: filtered };
  }

  return config
    .filter((child) => canAccessNavItem(child, access))
    .map((child) => recur(child));
};

/**
 * Find the first navigational item that the user has access to
 */
export const firstNavItemWithAccess = <T>(config: NavItem<T>[], access: T) => {
  return config
    .map((child) => (child.items ? [child, child.items] : child))
    .flat(3)
    .filter((i) => !!i)
    .map((child) => (child.items ? [child, child.items] : child))
    .flat(3)
    .filter((i) => !!i)
    .find((i) => i.path && canAccessNavItem(i, access));
};

/**
 * Transform all nav item 'path's to safe paths with provided params
 */
export const applySafePaths = <T>(
  config: NavItem<T>[],
  globalPathParams: Record<string, string>
) => {
  function recur(item: NavItem<T>): NavItem<T> {
    const { items, path, pathParams, ...rest } = item;
    const safePath = path
      ? generateSafePath(path, { ...globalPathParams, ...pathParams })
      : undefined;

    if (!items) return { path: safePath, ...rest };

    const mapped = items.map((child) => recur(child));
    return { ...rest, path: safePath, items: mapped };
  }

  return config.map((child) => recur(child));
};
