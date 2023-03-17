import { useMemo } from 'react';

import {
  Maybe,
  ProjectAccess,
  QueryAccess,
  useGetProjectPermissionsQuery,
  useGetRootPermissionsQuery,
} from '@/types/gqlTypes';

export interface PermissionsObject {
  [key: string]: boolean | null | undefined;
}
export type PermissionsMode = 'any' | 'all';

export const hasPermissionsOnObject = <T,>(
  permissions: (keyof T)[],
  permissionsObject: T,
  mode: PermissionsMode = 'any'
) => {
  if (mode === 'any')
    return permissions.some((p) => permissionsObject[p] === true);
  if (mode === 'all')
    return permissions.every((p) => permissionsObject[p] === true);
  return false;
};

export const useHasPermissions = <T,>(
  permObject: Maybe<T> | undefined,
  permissions: keyof T | (keyof T)[],
  mode: PermissionsMode = 'any'
) => {
  const permissionsList = Array.isArray(permissions)
    ? permissions
    : [permissions];
  if (!permObject) return false;
  return hasPermissionsOnObject(permissionsList, permObject, mode);
};

export type ProjectPermissions = keyof Omit<ProjectAccess, '__typename'>;
export const useHasProjectPermissions = (
  id: string,
  permissions: ProjectPermissions[],
  mode?: PermissionsMode
) => {
  const projectData = useGetProjectPermissionsQuery({
    variables: { id },
  });
  const result = useHasPermissions(
    projectData?.data?.project?.access,
    permissions,
    mode
  );

  return useMemo(() => [result, projectData] as const, [result, projectData]);
};

export type RootPermissions = keyof Omit<QueryAccess, '__typename'>;
export const useHasRootPermissions = (
  permissions: RootPermissions[],
  mode?: PermissionsMode
) => {
  const data = useGetRootPermissionsQuery();
  const result = useHasPermissions(data?.data?.access, permissions, mode);

  return useMemo(() => [result, data] as const, [result, data]);
};
