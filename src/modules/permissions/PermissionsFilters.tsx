import React from 'react';

import { useHasPermissions } from './useHasPermissionsHooks';

import {
  ProjectAccess,
  QueryAccess,
  useGetProjectPermissionsQuery,
  useGetRootPermissionsQuery,
} from '@/types/gqlTypes';

export type EntityPermissionsFilterProps<T> = {
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
}: EntityPermissionsFilterProps<T>): JSX.Element => {
  const hasPermission = useHasPermissions(object, permissions, mode);
  if (loading) return <></>;
  if (hasPermission) return <>{children}</>;
  if (otherwise) return <>{otherwise}</>;
  return <></>;
};

export type ProjectPermissionsFilterProps<T> = Omit<
  EntityPermissionsFilterProps<T>,
  'object' | 'loading'
> & { id: string };

export const ProjectPermissionsFilter: React.FC<
  ProjectPermissionsFilterProps<ProjectAccess>
> = ({ id, ...props }) => {
  const { data, loading } = useGetProjectPermissionsQuery({
    variables: { id },
  });
  const access = data?.project?.access;

  return <PermissionsFilter object={access} loading={loading} {...props} />;
};

export type RootPermissionsFilterProps<T> = Omit<
  EntityPermissionsFilterProps<T>,
  'object' | 'loading'
>;

export const RootPermissionsFilter: React.FC<
  RootPermissionsFilterProps<QueryAccess>
> = (props) => {
  const { data, loading } = useGetRootPermissionsQuery();
  const access = data?.access;

  return <PermissionsFilter object={access} loading={loading} {...props} />;
};
