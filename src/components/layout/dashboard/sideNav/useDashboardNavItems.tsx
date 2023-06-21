import { useMemo } from 'react';

import { NavItem } from './types';

import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ClientFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const useDashboardNavItems = (client?: ClientFieldsFragment) => {
  const [canViewEnrollments] = useHasClientPermissions(client?.id || '', [
    'canViewEnrollmentDetails',
  ]);
  const [canViewFiles] = useHasClientPermissions(client?.id || '', [
    'canViewAnyConfidentialClientFiles',
    'canViewAnyNonconfidentialClientFiles',
    'canManageOwnClientFiles',
  ]);
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
            path: generateSafePath(ClientDashboardRoutes.PROFILE, params),
          },
          ...(canViewEnrollments
            ? [
                {
                  id: 'enrollments',
                  title: 'Enrollments',
                  path: generateSafePath(
                    ClientDashboardRoutes.ALL_ENROLLMENTS,
                    params
                  ),
                },
                {
                  id: 'assessments',
                  title: 'Assessments',
                  path: generateSafePath(
                    ClientDashboardRoutes.ASSESSMENTS,
                    params
                  ),
                },
                {
                  id: 'services',
                  title: 'Services',
                  path: generateSafePath(
                    ClientDashboardRoutes.SERVICES,
                    params
                  ),
                },
              ]
            : []),
          /*
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
            path: generateSafePath(ClientDashboardRoutes.NOTES, params),
          },
          */
          ...(canViewFiles
            ? [
                {
                  id: 'files',
                  title: 'Files',
                  path: generateSafePath(ClientDashboardRoutes.FILES, params),
                },
              ]
            : []),
          // {
          //   title: 'Contact',
          //   path: ClientDashboardRoutes.CONTACT,
          // },
          // {
          //   title: 'Locations',
          //   path: ClientDashboardRoutes.LOCATIONS,
          // },
          // {
          //   title: 'Referrals',
          //   path: ClientDashboardRoutes.REFERRALS,
          // },
        ],
      },

      // {
      //   id: 'admin',
      //   title: 'Administrative',
      //   type: 'category',
      //   items: [
      //     {
      //       id: 'warehouse-link',
      //       title: 'View in Warehouse',
      //       path: undefined,
      //       href: client.warehouseUrl,
      //     },
      //   ],
      // },
    ];
  }, [client, canViewEnrollments, canViewFiles]);

  return navItems;
};
