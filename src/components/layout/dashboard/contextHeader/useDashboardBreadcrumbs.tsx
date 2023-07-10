import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { ClientDashboardContext } from '@/components/pages/ClientDashboard';
import useCurrentPath from '@/hooks/useCurrentPath';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  ClientDashboardRoutes,
  ProjectDashboardRoutes,
  Routes,
} from '@/routes/routes';

type CrumbConfig = {
  [x: string]: {
    title: string;
    parent?: string;
  };
};

interface Breadcrumb {
  to: string;
  label: string;
}

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

export const useProjectBreadcrumbConfig = (
  context: ProjectDashboardContext | undefined
): CrumbConfig => {
  return useMemo(() => {
    if (context == undefined) {
      return {};
    }
    return {
      [ProjectDashboardRoutes.OVERVIEW]: {
        title: context.project.projectName,
      },
      [ProjectDashboardRoutes.EDIT_PROJECT]: {
        title: 'Edit Project',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.ENROLLMENTS]: {
        title: 'Enrollments',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.ADD_SERVICES]: {
        title: 'Add Services',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.ADD_HOUSEHOLD]: {
        title: 'Add Enrollment',
        parent: ProjectDashboardRoutes.ENROLLMENTS,
      },
      [ProjectDashboardRoutes.REFERRALS]: {
        title: 'Referrals',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.ESG_FUNDING_REPORT]: {
        title: 'ESG Funding Report',
        parent: ProjectDashboardRoutes.REFERRALS,
      },
      [ProjectDashboardRoutes.NEW_OUTGOING_REFERRAL]: {
        title: 'Create Referral',
        parent: ProjectDashboardRoutes.REFERRALS,
      },
      [ProjectDashboardRoutes.REFERRAL_POSTING]: {
        title: 'Active Referral',
        parent: ProjectDashboardRoutes.REFERRALS,
      },
      [ProjectDashboardRoutes.NEW_REFERRAL_REQUEST]: {
        title: 'Request a Referral',
        parent: ProjectDashboardRoutes.REFERRALS,
      },
      [ProjectDashboardRoutes.FUNDERS]: {
        title: 'Funders',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.NEW_FUNDER]: {
        title: 'Add Funder',
        parent: ProjectDashboardRoutes.FUNDERS,
      },
      [ProjectDashboardRoutes.EDIT_FUNDER]: {
        title: 'Edit Funder',
        parent: ProjectDashboardRoutes.FUNDERS,
      },
      [ProjectDashboardRoutes.COCS]: {
        title: 'Project CoCs',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.NEW_COC]: {
        title: 'Add CoC',
        parent: ProjectDashboardRoutes.COCS,
      },
      [ProjectDashboardRoutes.EDIT_COC]: {
        title: 'Edit CoC',
        parent: ProjectDashboardRoutes.COCS,
      },
      [ProjectDashboardRoutes.INVENTORY]: {
        title: 'Inventory',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
      [ProjectDashboardRoutes.NEW_INVENTORY]: {
        title: 'Add Inventory',
        parent: ProjectDashboardRoutes.INVENTORY,
      },
      [ProjectDashboardRoutes.EDIT_INVENTORY]: {
        title: 'Update Inventory',
        parent: ProjectDashboardRoutes.INVENTORY,
      },
      [ProjectDashboardRoutes.UNITS]: {
        title: 'Units',
        parent: ProjectDashboardRoutes.OVERVIEW,
      },
    };
  }, [context]);
};

export const useClientBreadcrumbConfig = (
  context: ClientDashboardContext | undefined
): CrumbConfig => {
  return useMemo(() => {
    if (context == undefined) {
      return {};
    }
    return {
      /**
       * Map each path to it's title and it's direct parent
       */
      [ClientDashboardRoutes.PROFILE]: {
        title: clientBriefName(context.client),
      },
      [ClientDashboardRoutes.EDIT]: {
        title: 'Update Client Details',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.ALL_ENROLLMENTS]: {
        title: 'Enrollments',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.SERVICES]: {
        title: 'Services',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.NEW_ENROLLMENT]: {
        title: 'Add Enrollment',
        parent: ClientDashboardRoutes.ALL_ENROLLMENTS,
      },
      [ClientDashboardRoutes.VIEW_ENROLLMENT]: {
        title: context.enrollment
          ? enrollmentName(context.enrollment)
          : 'Enrollment',
        parent: ClientDashboardRoutes.ALL_ENROLLMENTS,
      },
      [ClientDashboardRoutes.ASSESSMENT]: {
        title: 'Assessment',
        parent: ClientDashboardRoutes.VIEW_ENROLLMENT,
      },
      [ClientDashboardRoutes.NEW_SERVICE]: {
        title: 'Add Service',
        parent: ClientDashboardRoutes.VIEW_ENROLLMENT,
      },
      [ClientDashboardRoutes.EDIT_SERVICE]: {
        title: 'Edit Service',
        parent: ClientDashboardRoutes.VIEW_ENROLLMENT,
      },
      [ClientDashboardRoutes.EDIT_HOUSEHOLD]: {
        title: 'Edit Household',
        parent: ClientDashboardRoutes.VIEW_ENROLLMENT,
      },
      [ClientDashboardRoutes.ASSESSMENTS]: {
        title: 'Assessments',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.NOTES]: {
        title: 'Notes',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.FILES]: {
        title: 'Files',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.AUDIT_HISTORY]: {
        title: 'Client Audit History',
        parent: ClientDashboardRoutes.PROFILE,
      },
      [ClientDashboardRoutes.NEW_FILE]: {
        title: 'Upload',
        parent: ClientDashboardRoutes.FILES,
      },
      [ClientDashboardRoutes.EDIT_FILE]: {
        title: 'Edit File',
        parent: ClientDashboardRoutes.FILES,
      },
    };
  }, [context]);
};

export const useAdminBreadcrumbConfig = (): CrumbConfig => {
  return useMemo(
    () => ({
      [Routes.ADMIN_REFERRAL_DENIAL]: {
        title: 'Manage Denial',
        parent: Routes.ADMIN_REFERRAL_DENIALS,
      },
      [Routes.ADMIN_REFERRAL_DENIALS]: {
        title: 'Denials',
        parent: Routes.ADMIN,
      },
      [Routes.ADMIN]: {
        title: 'Admin',
      },
    }),
    []
  );
};

export const useDashboardBreadcrumbs = (
  crumbConfig: CrumbConfig,
  breadcrumbOverrides?: Record<string, string>
): Array<Breadcrumb> => {
  const { pathname } = useLocation();

  const currentPath = useCurrentPath();
  const breadcrumbs = useMemo(() => {
    if (!currentPath) {
      console.warn('route not recognized', pathname);
      return [];
    }

    const paths = [currentPath];
    buildParentPaths(currentPath, paths, crumbConfig);
    const crumbs = paths.map((path) => ({
      to: path,
      label: breadcrumbOverrides?.[path] || crumbConfig[path]?.title || 'Page',
    }));

    return crumbs;
  }, [pathname, breadcrumbOverrides, crumbConfig, currentPath]);

  return breadcrumbs;
};
