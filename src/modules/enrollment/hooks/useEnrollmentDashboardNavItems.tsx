import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AllEnrollmentDetailsFragment,
  DataCollectionFeatureRole,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useEnrollmentDashboardNavItems = (
  enabledFeatures: DataCollectionFeatureRole[],
  enrollment?: AllEnrollmentDetailsFragment
) => {
  const navItems: NavItem[] = useMemo(() => {
    if (!enrollment) return [];
    const params = {
      clientId: enrollment.client.id,
      enrollmentId: enrollment.id,
    };

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
            hide: !enabledFeatures.includes(DataCollectionFeatureRole.Service),
          },
          {
            id: 'cls',
            title: 'Current Living Situations',
            path: EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
            hide: !enabledFeatures.includes(
              DataCollectionFeatureRole.CurrentLivingSituation
            ),
          },
          {
            id: 'events',
            title: 'CE Events',
            path: EnrollmentDashboardRoutes.EVENTS,
            hide: !enabledFeatures.includes(DataCollectionFeatureRole.CeEvent),
          },
          {
            id: 'ce-assessments',
            title: 'CE Assessments',
            path: EnrollmentDashboardRoutes.CE_ASSESSMENTS,
            hide: !enabledFeatures.includes(
              DataCollectionFeatureRole.CeAssessment
            ),
          },
          {
            id: 'custom-case-notes',
            title: 'Case Notes',
            path: EnrollmentDashboardRoutes.CUSTOM_CASE_NOTES,
            hide: !enabledFeatures.includes(DataCollectionFeatureRole.CaseNote),
          },
        ].map(({ path, ...rest }) => ({
          path: generateSafePath(path, params),
          ...rest,
        })),
      },
    ];
  }, [enabledFeatures, enrollment]);

  return navItems;
};
