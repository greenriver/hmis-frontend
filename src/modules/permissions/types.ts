import {
  ProjectAccessFieldsFragment,
  ClientAccessFieldsFragment,
  EnrollmentAccessFieldsFragment,
  RootPermissionsFragment,
} from '@/types/gqlTypes';

export type RootPermissions = keyof Omit<
  RootPermissionsFragment,
  '__typename' | 'id'
>;

export type ProjectPermissions = keyof Omit<
  ProjectAccessFieldsFragment,
  '__typename' | 'id'
>;
export type ClientPermissions = keyof Omit<
  ClientAccessFieldsFragment,
  '__typename' | 'id'
>;
export type EnrollmentPermissions = keyof Omit<
  EnrollmentAccessFieldsFragment,
  '__typename' | 'id'
>;

export type PermissionsMode = 'any' | 'all';
