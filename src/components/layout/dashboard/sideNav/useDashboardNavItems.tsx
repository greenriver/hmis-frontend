import { useMemo } from 'react';

import { NavItem } from './types';

import {
  useHasClientPermissions,
  useHasRootPermissions,
} from '@/modules/permissions/useHasPermissionsHooks';
import { DashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useDashboardNavItems = (client?: ClientFieldsFragment) => {
  const [canViewEnrollments] = useHasClientPermissions(client?.id || '', [
    'canViewEnrollmentDetails',
  ]);
  const [canViewFiles] = useHasClientPermissions(client?.id || '', [
    'canViewAnyConfidentialClientFiles',
    'canViewAnyNonconfidentialClientFiles',
  ]);
  const [canAuditClients] = useHasRootPermissions(['canAuditClients']);
  const navItems: NavItem[] = useMemo(() => {
    if (!client) return [];
    const params = { clientId: client.id };
    return [
      {
        id: 'client-nav',
        // title: 'Client Navigation',
        type: 'category',
        items: [
          {
            id: 'overview',
            title: 'Overview',
            path: generateSafePath(DashboardRoutes.PROFILE, params),
          },
          ...(canViewEnrollments
            ? [
                {
                  id: 'enrollments',
                  title: 'Enrollments',
                  path: generateSafePath(
                    DashboardRoutes.ALL_ENROLLMENTS,
                    params
                  ),
                },
                {
                  id: 'assessments',
                  title: 'Assessments',
                  path: generateSafePath(DashboardRoutes.ASSESSMENTS, params),
                },
              ]
            : []),
          {
            id: 'services-and-contacts',
            title: 'Services and Contacts',
            type: 'topic',
            items: [
              {
                id: 'services',
                title: 'Locations Map',
                href: '/',
              },
              {
                id: 'contacts',
                title: 'Services Calendar',
                href: '/',
              },
            ],
          },

          {
            id: 'notes',
            title: 'Notes',
            path: generateSafePath(DashboardRoutes.NOTES, params),
          },
          ...(canViewFiles
            ? [
                {
                  id: 'files',
                  title: 'Files',
                  path: generateSafePath(DashboardRoutes.FILES, params),
                },
              ]
            : []),
          // {
          //   title: 'Contact',
          //   path: DashboardRoutes.CONTACT,
          // },
          // {
          //   title: 'Locations',
          //   path: DashboardRoutes.LOCATIONS,
          // },
          // {
          //   title: 'Referrals',
          //   path: DashboardRoutes.REFERRALS,
          // },
        ],
      },

      {
        id: 'admin',
        title: 'Administrative',
        type: 'category',
        items: [
          ...(canAuditClients
            ? [
                {
                  id: 'audit',
                  title: 'Audit History',
                  path: generateSafePath(DashboardRoutes.HISTORY, params),
                },
              ]
            : []),

          {
            id: 'warehouse-link',
            title: 'View in Warehouse',
            path: undefined,
            href: client.warehouseUrl,
          },
        ],
      },
    ];
  }, [client, canViewEnrollments, canViewFiles, canAuditClients]);

  return navItems;
};
