import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';

import { NavItem } from './SideNavMenu';

import { DashboardRoutes } from '@/routes/routes';

export const useDashboardNavItems = (clientId?: string) => {
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
            path: generatePath(DashboardRoutes.PROFILE, params),
          },
          {
            id: 'enrollments',
            title: 'Enrollments',
            path: generatePath(DashboardRoutes.ALL_ENROLLMENTS, params),
          },
          {
            id: 'assessments',
            title: 'Assessments',
            path: generatePath(DashboardRoutes.ASSESSMENTS, params),
          },
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
            path: generatePath(DashboardRoutes.NOTES, params),
          },
          {
            id: 'files',
            title: 'Files',
            path: generatePath(DashboardRoutes.FILES, params),
          },
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
  }, [clientId]);

  return navItems;
};
