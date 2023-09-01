import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { featureEnabledForEnrollment } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AllEnrollmentDetailsFragment,
  DataCollectionFeatureRole,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useEnrollmentDashboardNavItems = (
  enrollment?: AllEnrollmentDetailsFragment
) => {
  const navItems: NavItem[] = useMemo(() => {
    if (!enrollment) return [];
    const params = {
      clientId: enrollment.client.id,
      enrollmentId: enrollment.id,
    };
    const enabledFeatures = enrollment.project.dataCollectionFeatures
      .filter((feature) =>
        featureEnabledForEnrollment(
          feature,
          enrollment.client,
          enrollment.relationshipToHoH
        )
      )
      .map((r) => r.role);

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
            requiredRole: DataCollectionFeatureRole.Service,
          },
          {
            id: 'cls',
            title: 'Current Living Situations',
            path: EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
            requiredRole: DataCollectionFeatureRole.CurrentLivingSituation,
          },
          {
            id: 'events',
            title: 'CE Events',
            path: EnrollmentDashboardRoutes.EVENTS,
            requiredRole: DataCollectionFeatureRole.CeEvent,
          },
          {
            id: 'ce-assessments',
            title: 'CE Assessments',
            path: EnrollmentDashboardRoutes.CE_ASSESSMENTS,
            requiredRole: DataCollectionFeatureRole.CeAssessment,
          },
        ]
          .filter(
            (item) =>
              !item.requiredRole || enabledFeatures.includes(item.requiredRole)
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
