import { useMemo } from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { DashboardContext } from '@/components/pages/ClientDashboard';
import { clientName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';

type CrumbConfig = {
  [x: string]: {
    title: string;
    parent?: string;
  };
};

const buildParentPaths = (
  currentRoute: string,
  crumbs: string[],
  config: CrumbConfig
) => {
  const parent = config[currentRoute]?.parent;
  if (parent) {
    crumbs.unshift(parent);
    buildParentPaths(parent, crumbs, config);
  }
};

export const useDashboardBreadcrumbs = (
  context: DashboardContext,
  breadcrumbOverrides?: Record<string, string>
) => {
  const crumbConfig: CrumbConfig = useMemo(
    () => ({
      /**
       * Map each path to it's title and it's direct parent
       */
      [DashboardRoutes.PROFILE]: { title: clientName(context.client) },
      [DashboardRoutes.EDIT]: {
        title: 'Update Client Details',
        parent: DashboardRoutes.PROFILE,
      },
      [DashboardRoutes.ALL_ENROLLMENTS]: {
        title: 'Enrollments',
        parent: DashboardRoutes.PROFILE,
      },
      [DashboardRoutes.NEW_ENROLLMENT]: {
        title: 'Add Enrollment',
        parent: DashboardRoutes.ALL_ENROLLMENTS,
      },
      [DashboardRoutes.VIEW_ENROLLMENT]: {
        title: context.enrollment
          ? enrollmentName(context.enrollment)
          : 'Enrollment',
        parent: DashboardRoutes.ALL_ENROLLMENTS,
      },
      [DashboardRoutes.VIEW_ASSESSMENT]: {
        title: 'Assessment',
        parent: DashboardRoutes.VIEW_ENROLLMENT,
      },
      [DashboardRoutes.NEW_ASSESSMENT]: {
        title: 'Assessment',
        parent: DashboardRoutes.VIEW_ENROLLMENT,
      },
      [DashboardRoutes.EDIT_ASSESSMENT]: {
        title: 'Assessment',
        parent: DashboardRoutes.VIEW_ENROLLMENT,
      },
      [DashboardRoutes.EDIT_HOUSEHOLD]: {
        title: 'Update Household',
        parent: DashboardRoutes.VIEW_ENROLLMENT,
      },
      [DashboardRoutes.ASSESSMENTS]: {
        title: 'Assessments',
        parent: DashboardRoutes.PROFILE,
      },
      [DashboardRoutes.NOTES]: {
        title: 'Notes',
        parent: DashboardRoutes.PROFILE,
      },
      [DashboardRoutes.FILES]: {
        title: 'Files',
        parent: DashboardRoutes.PROFILE,
      },
    }),
    [context]
  );
  const { pathname } = useLocation();

  const breadcrumbs = useMemo(() => {
    const matches = matchRoutes(
      Object.values(DashboardRoutes).map((s) => ({
        path: s,
      })),
      pathname
    );
    if (!matches) {
      console.warn('route not recognized', pathname);
      return [];
    }

    const route = matches[0].route;
    if (!route.path) {
      console.warn('route not recognized', pathname);
      return [];
    }

    const paths: string[] = [route.path];
    buildParentPaths(route.path, paths, crumbConfig);

    const crumbs = paths.map((path) => ({
      to: path,
      label: breadcrumbOverrides?.[path] || crumbConfig[path]?.title || 'Page',
    }));

    return crumbs;
  }, [pathname, breadcrumbOverrides, crumbConfig]);

  return breadcrumbs;
};
