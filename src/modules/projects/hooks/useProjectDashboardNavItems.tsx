import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  DataCollectionFeatureRole,
  ProjectAllFieldsFragment,
  ProjectType,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
            hide: !project.access.canViewEnrollmentDetails,
          },
          {
            id: 'services',
            title: 'Services',
            path: ProjectDashboardRoutes.PROJECT_SERVICES,
            hide:
              !project.access.canViewEnrollmentDetails ||
              !dataCollectionRoles.includes(DataCollectionFeatureRole.Service),
          },
          {
            id: 'bed-nights',
            title: 'Bed Nights',
            path: ProjectDashboardRoutes.PROJECT_BED_NIGHTS,
            hide:
              !project.access.canViewEnrollmentDetails ||
              project.projectType !== ProjectType.EsNbn,
          },
          {
            id: 'referrals',
            title: 'Referrals',
            path: generateSafePath(ProjectDashboardRoutes.REFERRALS, params),
            hide:
              !globalFeatureFlags?.externalReferrals ||
              (!project.access.canManageIncomingReferrals &&
                !project.access.canManageOutgoingReferrals),
          },
        ].map(({ path, ...rest }) => ({
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
            hide: !project.access.canManageInventory,
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
          {
            id: 'hmis-participation',
            title: 'HMIS Participation',
            path: ProjectDashboardRoutes.HMIS_PARTICIPATION,
          },
          {
            id: 'ce-participation',
            title: 'CE Participation',
            path: ProjectDashboardRoutes.CE_PARTICIPATION,
          },
        ].map(({ path, ...rest }) => ({
          path: generateSafePath(path, params),
          ...rest,
        })),
      },
    ];
  }, [globalFeatureFlags, project]);

  return navItems;
};
