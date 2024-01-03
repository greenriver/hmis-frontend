import { useMemo } from 'react';

import { NavItem } from '../../../components/layout/dashboard/sideNav/types';

import {
  useClientPermissions,
  useRootPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ClientAccessFieldsFragment } from '@/types/gqlTypes';

export const useClientDashboardNavItems = (clientId: string) => {
  const [rootAccess] = useRootPermissions();
  const [clientAccess] = useClientPermissions(clientId);

  // TODO: move this logic to the backend and resolve it on ClientAccess
  const canViewFiles =
    clientAccess?.canViewAnyConfidentialClientFiles ||
    clientAccess?.canViewAnyNonconfidentialClientFiles ||
    clientAccess?.canManageOwnClientFiles;

  const navItems: NavItem<ClientAccessFieldsFragment>[] = useMemo(() => {
    return [
      {
        id: 'client-nav',
        type: 'category',
        items: [
          {
            id: 'overview',
            title: 'Overview',
            path: ClientDashboardRoutes.PROFILE,
          },
          {
            id: 'enrollments',
            title: 'Enrollments',
            path: ClientDashboardRoutes.CLIENT_ENROLLMENTS,
            permissions: ['canViewEnrollmentDetails'],
          },
          {
            id: 'assessments',
            title: 'Assessments',
            path: ClientDashboardRoutes.ASSESSMENTS,
            permissions: ['canViewEnrollmentDetails'],
          },
          {
            id: 'services',
            title: 'Services',
            path: ClientDashboardRoutes.SERVICES,
            permissions: ['canViewEnrollmentDetails'],
          },

          {
            id: 'files',
            title: 'Files',
            path: ClientDashboardRoutes.FILES,
            hide: !canViewFiles,
          },
          // TODO: only show if Case Notes feature is enabled for any project globally
          {
            id: 'case-notes',
            title: 'Case Notes',
            path: ClientDashboardRoutes.CASE_NOTES,
          },
        ],
      },
      {
        id: 'admin',
        title: 'Admin',
        type: 'category',
        items: [
          {
            id: 'audit-history',
            title: 'Audit History',
            path: ClientDashboardRoutes.AUDIT_HISTORY,
            permissions: ['canAuditClients'],
          },
          {
            id: 'merges',
            title: 'Merge History',
            path: ClientDashboardRoutes.MERGE_HISTORY,
            // TODO: resolve this on ClientAccess
            hide: !rootAccess?.canMergeClients,
          },
        ],
      },
    ];
  }, [canViewFiles, rootAccess]);

  return navItems;
};
