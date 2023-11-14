import { useMemo } from 'react';

import { NavItem } from '../../../components/layout/dashboard/sideNav/types';

import {
  useClientPermissions,
  useRootPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useClientDashboardNavItems = (client?: ClientFieldsFragment) => {
  const [rootAccess] = useRootPermissions();
  const [clientAccess] = useClientPermissions(client?.id || '');

  const canViewEnrollments = !!clientAccess?.canViewEnrollmentDetails;
  const canViewFiles =
    clientAccess?.canViewAnyConfidentialClientFiles ||
    clientAccess?.canViewAnyNonconfidentialClientFiles ||
    clientAccess?.canManageOwnClientFiles;

  const navItems: NavItem[] = useMemo(() => {
    if (!client) return [];
    const params = { clientId: client.id };
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
            hide: !canViewEnrollments,
          },
          {
            id: 'assessments',
            title: 'Assessments',
            path: ClientDashboardRoutes.ASSESSMENTS,
            hide: !canViewEnrollments,
          },
          {
            id: 'services',
            title: 'Services',
            path: ClientDashboardRoutes.SERVICES,
            hide: !canViewEnrollments,
          },

          {
            id: 'files',
            title: 'Files',
            path: ClientDashboardRoutes.FILES,
            hide: !canViewFiles,
          },
        ].map(({ path, ...rest }) => ({
          path: generateSafePath(path, params),
          ...rest,
        })),
      },
      {
        id: 'admin',
        title: 'Admin',
        type: 'category',
        items: [
          {
            id: 'audit-history',
            title: 'Audit History',
            path: generateSafePath(ClientDashboardRoutes.AUDIT_HISTORY, params),
            hide: !clientAccess?.canAuditClients,
          },
          {
            id: 'merges',
            title: 'Merge History',
            path: generateSafePath(ClientDashboardRoutes.MERGE_HISTORY, params),
            hide: !rootAccess?.canMergeClients,
          },
        ],
      },
    ];
  }, [client, canViewEnrollments, canViewFiles, clientAccess, rootAccess]);

  return navItems;
};
