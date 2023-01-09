import { useLocation, useOutletContext, useParams } from 'react-router-dom';

import { DashboardContext } from '@/components/pages/ClientDashboard';
import { clientName, enrollmentName } from '@/modules/hmis/hmisUtil';
import apolloClient from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  EnrollmentFieldsFragmentDoc,
  useGetEnrollmentQuery,
} from '@/types/gqlTypes';

export function useEnrollmentCrumbs(current?: string) {
  const { client } = useOutletContext<DashboardContext>();
  const { pathname } = useLocation();
  const { enrollmentId } = useParams() as { enrollmentId: string };

  // get enrollment from cache if we have it
  const enrollment = apolloClient.readFragment({
    id: `Enrollment:${enrollmentId}`,
    fragment: EnrollmentFieldsFragmentDoc,
  });

  // otherwise query for it
  const { loading, error } = useGetEnrollmentQuery({
    variables: { id: enrollmentId },
    skip: !!enrollment,
  });
  if (error) throw error;

  const crumbs = enrollment
    ? [
        {
          label: clientName(client),
          to: DashboardRoutes.PROFILE,
        },
        {
          label: 'All Enrollments',
          to: DashboardRoutes.ALL_ENROLLMENTS,
        },
        {
          label: enrollmentName(enrollment),
          to: DashboardRoutes.VIEW_ENROLLMENT,
        },
        ...(current ? [{ label: current, to: pathname }] : []),
      ]
    : undefined;

  return [crumbs, loading, enrollment] as [
    crumbs: { label: string; to: string }[] | undefined,
    loading: boolean,
    enrollment: EnrollmentFieldsFragment | undefined
  ];
}
