import { useMemo } from 'react';

import {
  ClientAccess,
  Maybe,
  OrganizationAccess,
  ProjectAccess,
  QueryAccess,
  useGetClientPermissionsQuery,
  useGetOrganizationPermissionsQuery,
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

export type OrganizationPermissions = keyof Omit<
  OrganizationAccess,
  '__typename'
>;
export const useHasOrganizationPermissions = (
  id: string,
  permissions: OrganizationPermissions[],
  mode?: PermissionsMode
) => {
  const organizationData = useGetOrganizationPermissionsQuery({
    variables: { id },
  });
  const result = useHasPermissions(
    organizationData?.data?.organization?.access,
    permissions,
    mode
  );

  return useMemo(
    () => [result, organizationData] as const,
    [result, organizationData]
  );
};

export type ClientPermissions = keyof Omit<ClientAccess, '__typename'>;
export const useHasClientPermissions = (
  id: string,
  permissions: ClientPermissions[],
  mode?: PermissionsMode
) => {
  const clientData = useGetClientPermissionsQuery({
    variables: { id },
  });
  const result = useHasPermissions(
    clientData?.data?.client?.access,
    permissions,
    mode
  );

  return useMemo(() => [result, clientData] as const, [result, clientData]);
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
