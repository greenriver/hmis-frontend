import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { AllEnrollmentDetailsFragment, FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useEnrollmentDashboardNavItems = (
  enrollment?: AllEnrollmentDetailsFragment
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
    const dataCollectionRoles = enrollment.project.dataCollectionFeatures.map(
      (r) => r.role
    );

    return [
      {
        id: 'enrollment-nav',
        type: 'category',
        items: [
          {
            id: 'overview',
            title: 'Enrollment Overview',
            path: EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
          },
          {
            id: 'household',
            title: 'Household',
            path: EnrollmentDashboardRoutes.HOUSEHOLD,
          },
          {
            id: 'assessments',
            title: 'Assessments',
            path: EnrollmentDashboardRoutes.ASSESSMENTS,
          },
          {
            id: 'services',
            title: 'Services',
            path: EnrollmentDashboardRoutes.SERVICES,
            requiredRole: FormRole.Service,
          },
          {
            id: 'cls',
            title: 'Current Living Situations',
            path: EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
            requiredRole: FormRole.CurrentLivingSituation,
          },
          {
            id: 'events',
            title: 'CE Events',
            path: EnrollmentDashboardRoutes.EVENTS,
            requiredRole: FormRole.CeEvent,
          },
          {
            id: 'ce-assessments',
            title: 'CE Assessments',
            path: EnrollmentDashboardRoutes.CE_ASSESSMENTS,
            requiredRole: FormRole.CeAssessment,
          },
        ]
          .filter(
            (item) =>
              !item.requiredRole ||
              // FIXME: needs to check data collected about too
              dataCollectionRoles.includes(item.requiredRole)
          )
          .map(({ path, ...rest }) => ({
            path: generateSafePath(path, params),
            ...rest,
          })),
      },
    ];
  }, [enrollment]);

  return navItems;
};
