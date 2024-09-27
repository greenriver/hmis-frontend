import { useLocation } from 'react-router-dom';

import apolloClient from '@/app/apolloClient';
import { Routes } from '@/app/routes';
import useSafeParams from '@/hooks/useSafeParams';
import {
  GetOrganizationQuery,
  OrganizationNameFieldsFragmentDoc,
  useGetOrganizationQuery,
} from '@/types/gqlTypes';

export const ALL_PROJECTS_CRUMB = {
  label: 'Projects',
  to: Routes.ALL_PROJECTS,
};

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
