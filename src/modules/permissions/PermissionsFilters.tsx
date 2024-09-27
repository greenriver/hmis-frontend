import React from 'react';

import { useHasPermissions } from './useHasPermissionsHooks';

import apolloClient from '@/app/apolloClient';
import {
  ClientAccess,
  ClientAccessFieldsFragmentDoc,
  OrganizationAccess,
  ProjectAccess,
  RootPermissionsFragment,
  useGetClientPermissionsQuery,
  useGetOrganizationQuery,
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
  if (loading && !object) return <></>;
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

export type OrganizationPermissionsFilterProps<T> = Omit<
  EntityPermissionsFilterProps<T>,
  'object' | 'loading'
> & { id: string };

export const OrganizationPermissionsFilter: React.FC<
  OrganizationPermissionsFilterProps<OrganizationAccess>
> = ({ id, ...props }) => {
  const { data, loading } = useGetOrganizationQuery({
    variables: { id },
  });
  const access = data?.organization?.access;

  return <PermissionsFilter object={access} loading={loading} {...props} />;
};

export type ClientPermissionsFilterProps<T> = Omit<
  EntityPermissionsFilterProps<T>,
  'object' | 'loading'
> & { id: string };

export const ClientPermissionsFilter: React.FC<
  ClientPermissionsFilterProps<ClientAccess>
> = ({ id, ...props }) => {
  // read ClientAccess from cache if we have it
  const access = id
    ? apolloClient.readFragment({
        id: `ClientAccess:${id}`,
        fragment: ClientAccessFieldsFragmentDoc,
        fragmentName: 'ClientAccessFields',
      })
    : undefined;

  // otherwise query for it
  const { loading, error } = useGetClientPermissionsQuery({
    variables: { id },
    skip: !!access || !id,
  });
  if (error) throw error;

  return <PermissionsFilter object={access} loading={loading} {...props} />;
};

export type RootPermissionsFilterProps<T> = Omit<
  EntityPermissionsFilterProps<T>,
  'object' | 'loading'
>;

export const RootPermissionsFilter: React.FC<
  RootPermissionsFilterProps<RootPermissionsFragment>
> = (props) => {
  const { data, loading } = useGetRootPermissionsQuery();
  const access = data?.access;

  return <PermissionsFilter object={access} loading={loading} {...props} />;
};
