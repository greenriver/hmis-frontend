import { useMemo } from 'react';

import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  DataCollectionFeatureRole,
  ProjectAccessFieldsFragment,
  ProjectAllFieldsFragment,
  RecordType,
} from '@/types/gqlTypes';

export const useProjectDashboardNavItems = (
  project?: ProjectAllFieldsFragment
) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const navItems: NavItem<ProjectAccessFieldsFragment>[] = useMemo(() => {
    if (!project) return [];
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
            id: 'assessments',
            title: 'Assessments',
            path: ProjectDashboardRoutes.PROJECT_ASSESSMENTS,
            hide: !project.access.canViewEnrollmentDetails,
          },
          {
            id: 'services',
            title: 'Services',
            path: ProjectDashboardRoutes.PROJECT_SERVICES,
            permissions: ['canViewEnrollmentDetails'],
            hide: !dataCollectionRoles.includes(
              DataCollectionFeatureRole.Service
            ),
          },

          {
            id: 'externalForms',
            title: 'External Forms',
            path: ProjectDashboardRoutes.EXTERNAL_FORM_SUBMISSIONS,
            permissions: ['canManageExternalFormSubmissions'],
            hide: !dataCollectionRoles.includes(
              DataCollectionFeatureRole.ExternalForm
            ),
          },
          {
            id: 'bed-nights',
            title: 'Bed Nights',
            path: ProjectDashboardRoutes.BULK_BED_NIGHTS,
            permissions: ['canEditEnrollments'],
            hide: !project.serviceTypes.find(
              ({ hudRecordType }) => hudRecordType === RecordType.BedNight
            ),
          },
          {
            id: 'bulk-service',
            title: 'Bulk Services',
            path: ProjectDashboardRoutes.BULK_ASSIGN_SERVICE,
            permissions: ['canEditEnrollments'],
            hide: !project.serviceTypes.find((s) => s.supportsBulkAssignment),
          },
          {
            id: 'referrals',
            title: 'Referrals',
            path: ProjectDashboardRoutes.REFERRALS,
            permissions: [
              'canManageIncomingReferrals',
              'canManageOutgoingReferrals',
            ],
            permissionMode: 'any',
            hide: !globalFeatureFlags?.externalReferrals,
          },
        ],
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
            permissions: ['canManageInventory'],
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
        ],
      },
    ];
  }, [globalFeatureFlags, project]);

  return navItems;
};
