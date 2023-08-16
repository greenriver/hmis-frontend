import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useEnrollmentDashboardNavItems = (
  enrollment?: EnrollmentFieldsFragment
) => {
  // const [canViewEnrollments] = useHasClientPermissions(client?.id || '', [
  //   'canViewEnrollmentDetails',
  // ]);
  // const [canViewFiles] = useHasClientPermissions(client?.id || '', [
  //   'canViewAnyConfidentialClientFiles',
  //   'canViewAnyNonconfidentialClientFiles',
  //   'canManageOwnClientFiles',
  // ]);
  const navItems: NavItem[] = useMemo(() => {
    if (!enrollment) return [];
    const params = {
      clientId: enrollment.client.id,
      enrollmentId: enrollment.id,
    };
    return [
      {
        id: 'enrollment-nav',
        // title: 'Client Navigation',
        type: 'category',
        items: [
          {
            id: 'overview',
            title: 'Enrollment Overview',
            path: generateSafePath(
              EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
              params
            ),
          },
          {
            id: 'household',
            title: 'Household',
            path: generateSafePath(EnrollmentDashboardRoutes.HOUSEHOLD, params),
          },
          {
            id: 'assessments',
            title: 'Assessments',
            path: generateSafePath(
              EnrollmentDashboardRoutes.ASSESSMENTS,
              params
            ),
          },
          {
            id: 'services',
            title: 'Services',
            path: generateSafePath(EnrollmentDashboardRoutes.SERVICES, params),
          },
          {
            id: 'cls',
            title: 'Current Living Situations',
            path: generateSafePath(
              EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
              params
            ),
          },
          {
            id: 'events',
            title: 'CE Events',
            path: generateSafePath(EnrollmentDashboardRoutes.EVENTS, params),
          },
        ],
      },
    ];
  }, [enrollment]);

  return navItems;
};
