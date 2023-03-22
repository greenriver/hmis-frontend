import { useMemo } from 'react';

import { NavItem } from './types';

import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { DashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

export const useDashboardNavItems = (clientId?: string) => {
  const [canViewEnrollments] = useHasClientPermissions(clientId || '', [
    'canViewEnrollmentDetails',
  ]);
  const [canViewFiles] = useHasClientPermissions(clientId || '', [
    'canViewAnyConfidentialClientFiles',
    'canViewAnyNonconfidentialClientFiles',
  ]);
  const navItems: NavItem[] = useMemo(() => {
    if (!clientId) return [];
    const params = { clientId };
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
          {
            id: 'audit',
            title: 'Audit History',
            path: DashboardRoutes.HISTORY,
          },
          ...(clientId && import.meta.env.PUBLIC_WAREHOUSE_URL
            ? [
                {
                  id: 'warehouse-link',
                  title: 'View in Warehouse',
                  path: undefined,
                  href: `${
                    import.meta.env.PUBLIC_WAREHOUSE_URL
                  }clients/${clientId}/from_source`,
                },
              ]
            : []),
        ],
      },
    ];
  }, [clientId, canViewEnrollments, canViewFiles]);

  return navItems;
};
