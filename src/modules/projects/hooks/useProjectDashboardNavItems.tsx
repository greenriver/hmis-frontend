import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  DataCollectionFeatureRole,
  ProjectAllFieldsFragment,
  ProjectType,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useProjectDashboardNavItems = (
  project?: ProjectAllFieldsFragment
) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const navItems: NavItem[] = useMemo(() => {
    if (!project) return [];
    const params = { projectId: project.id };
    const dataCollectionRoles = project.dataCollectionFeatures.map(
      (r) => r.role
    );

    return [
      {
        id: 'project-nav',
        type: 'category',
        items: [
          {
            id: 'overview',
            title: 'Overview',
            path: ProjectDashboardRoutes.OVERVIEW,
          },
          {
            id: 'enrollments',
            title: 'Enrollments',
            path: ProjectDashboardRoutes.PROJECT_ENROLLMENTS,
            requiresEnrollmentAccess: true,
          },
          {
            id: 'services',
            title: 'Services',
            path: ProjectDashboardRoutes.PROJECT_SERVICES,
            requiresEnrollmentAccess: true,
            requiredRole: DataCollectionFeatureRole.Service,
          },
          {
            id: 'bed-nights',
            title: 'Bed Nights',
            path: ProjectDashboardRoutes.PROJECT_BED_NIGHTS,
            requiresEnrollmentAccess: true,
            condition: () => project.projectType === ProjectType.EsNbn,
          },
          {
            id: 'referrals',
            title: 'Referrals',
            path: generateSafePath(ProjectDashboardRoutes.REFERRALS, params),
            condition: () =>
              globalFeatureFlags?.externalReferrals &&
              !project.access.canManageIncomingReferrals &&
              !project.access.canManageOutgoingReferrals,
          },
        ]
          .filter((item) => !item.condition || item.condition())
          .filter(
            (item) =>
              !item.requiresEnrollmentAccess ||
              project.access.canViewEnrollmentDetails
          )
          .filter(
            (item) =>
              !item.requiredRole ||
              dataCollectionRoles.includes(item.requiredRole)
          )
          .map(({ path, ...rest }) => ({
            path: generateSafePath(path, params),
            ...rest,
          })),
      },
      {
        id: 'setup',
        title: 'Configuration',
        type: 'category',
        items: [
          {
            id: 'units',
            title: 'Units',
            path: ProjectDashboardRoutes.UNITS,
            condition: () => project.access.canManageInventory,
          },
          {
            id: 'inventory',
            title: 'Inventory',
            path: ProjectDashboardRoutes.INVENTORY,
          },
          {
            id: 'funders',
            title: 'Funders',
            path: ProjectDashboardRoutes.FUNDERS,
          },
          {
            id: 'cocs',
            title: 'CoCs',
            path: ProjectDashboardRoutes.COCS,
          },
        ]
          .filter((item) => !item.condition || item.condition())
          .map(({ path, ...rest }) => ({
            path: generateSafePath(path, params),
            ...rest,
          })),
      },
    ];
  }, [globalFeatureFlags, project]);

  return navItems;
};
