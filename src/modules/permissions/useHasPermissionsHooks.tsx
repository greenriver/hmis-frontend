import { useMemo } from 'react';

import {
  ClientPermissions,
  PermissionsMode,
  ProjectPermissions,
  RootPermissions,
} from './types';

import {
  Maybe,
  useGetClientPermissionsQuery,
  useGetProjectPermissionsQuery,
  useGetRootPermissionsQuery,
} from '@/types/gqlTypes';

export interface PermissionsObject {
  [key: string]: boolean | null | undefined;
}

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

export const useHasProjectPermissions = (
  projectId: string,
  permissions: ProjectPermissions[],
  mode?: PermissionsMode
) => {
  const projectData = useGetProjectPermissionsQuery({
    variables: { id: projectId },
  });
  const result = useHasPermissions(
    projectData?.data?.project?.access,
    permissions,
    mode
  );

  return useMemo(() => [result, projectData] as const, [result, projectData]);
};

export const useProjectPermissions = (projectId: string) => {
  const { data, ...status } = useGetProjectPermissionsQuery({
    variables: { id: projectId },
  });

  return useMemo(
    () => [data?.project?.access, status] as const,
    [data, status]
  );
};

export const useHasClientPermissions = (
  id: string,
  permissions: ClientPermissions[],
  mode?: PermissionsMode
) => {
  const clientData = useGetClientPermissionsQuery({
    variables: { id },
    skip: !id,
  });
  const result = useHasPermissions(
    clientData?.data?.client?.access,
    permissions,
    mode
  );

  return useMemo(() => [result, clientData] as const, [result, clientData]);
};

export const useClientPermissions = (id: string) => {
  const clientData = useGetClientPermissionsQuery({
    variables: { id },
    skip: !id,
  });

  return useMemo(
    () => [clientData?.data?.client?.access, clientData] as const,
    [clientData]
  );
};

export const useHasRootPermissions = (
  permissions: RootPermissions[],
  mode?: PermissionsMode
) => {
  const data = useGetRootPermissionsQuery();
  const result = useHasPermissions(data?.data?.access, permissions, mode);

  return useMemo(() => [result, data] as const, [result, data]);
};

export const useRootPermissions = () => {
  const rootData = useGetRootPermissionsQuery();

  return useMemo(() => [rootData?.data?.access, rootData] as const, [rootData]);
};
