import { useLocation, useParams } from 'react-router-dom';

import { ALL_PROJECTS_CRUMB } from './useProjectCrumbs';

import apolloClient from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  GetOrganizationQuery,
  OrganizationFieldsFragmentDoc,
  useGetOrganizationQuery,
} from '@/types/gqlTypes';

export function useOrganizationCrumbs(current?: string) {
  const { organizationId } = useParams() as {
    organizationId: string;
  };
  const { pathname } = useLocation();

  // get org name from cache if we have it
  const organizationNameFragment = apolloClient.readFragment({
    id: `Organization:${organizationId}`,
    fragment: OrganizationFieldsFragmentDoc,
    fragmentName: 'OrganizationFields',
  });

  const {
    data: { organization } = {},
    loading,
    error,
    // FIXME: this includes the entire project list, which we don't always need
  } = useGetOrganizationQuery({ variables: { id: organizationId } });

  if (error) throw error;
  if (!loading && !organization) throw Error('Organization not found');

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
    organization: GetOrganizationQuery['organization'] | undefined;
    organizationName: string | undefined;
  };
}
