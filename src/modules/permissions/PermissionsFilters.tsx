import React from 'react';

import { useHasPermissions } from './useHasPermissionsHooks';

import { ProjectAccess, useGetProjectPermissionsQuery } from '@/types/gqlTypes';

export type ProjectPermissionsFilterProps<T> = {
  object: T | undefined | null;
  permissions?: keyof T | (keyof T)[];
  otherwise?: React.ReactNode;
  mode?: 'any' | 'all';
  loading?: boolean;
  children?: React.ReactNode;
};

export const PermissionsFilter = <T,>({
  object,
  permissions = [],
  mode,
  loading,
  children,
  otherwise,
}: ProjectPermissionsFilterProps<T>): JSX.Element => {
  const hasPermission = useHasPermissions(object, permissions, mode);
  if (loading) return <></>;
  if (hasPermission) return <>{children}</>;
  if (otherwise) return <>{otherwise}</>;
  return <></>;
};

export type EntityPermissionsFilterProps<T> = Omit<
  ProjectPermissionsFilterProps<T>,
  'object' | 'loading'
> & { id: string };

export const ProjectPermissionsFilter: React.FC<
  EntityPermissionsFilterProps<ProjectAccess>
> = ({ id, ...props }) => {
  const { data, loading } = useGetProjectPermissionsQuery({
    variables: { id },
  });
  const access = data?.project?.access;

  return <PermissionsFilter object={access} loading={loading} {...props} />;
};
