import { useLocation } from 'react-router-dom';

import { ALL_PROJECTS_CRUMB } from './useProjectCrumbs';

import useSafeParams from '@/hooks/useSafeParams';
import apolloClient from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  GetOrganizationQuery,
  OrganizationNameFieldsFragmentDoc,
  useGetOrganizationQuery,
} from '@/types/gqlTypes';

export function useOrganizationCrumbs(current?: string) {
  const { organizationId } = useSafeParams() as {
    organizationId: string;
  };
  const { pathname } = useLocation();

  // get org name from cache if we have it
  const organizationNameFragment = apolloClient.readFragment({
    id: `Organization:${organizationId}`,
    fragment: OrganizationNameFieldsFragmentDoc,
    fragmentName: 'OrganizationNameFields',
  });

  const {
    data: { organization } = {},
    loading,
    error,
  } = useGetOrganizationQuery({ variables: { id: organizationId } });

  if (error) throw error;

  const organizationName =
    organizationNameFragment?.organizationName ||
    organization?.organizationName ||
    `Organization ${organizationId}`;

  const crumbs = [
    ALL_PROJECTS_CRUMB,
    {
      label: organizationName,
      to: Routes.ORGANIZATION,
    },
    ...(current ? [{ label: current, to: pathname }] : []),
  ];

  return { crumbs, loading, organization, organizationName } as {
    crumbs: { label: string; to: string }[] | undefined;
    loading: boolean;
    organization?: GetOrganizationQuery['organization'];
    organizationName?: string;
  };
}
