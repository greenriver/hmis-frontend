import { SvgIconComponent } from '@mui/icons-material';
import { merge, startCase } from 'lodash-es';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { ClientDashboardContext } from '@/components/pages/ClientDashboard';
import { EnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import useCurrentPath from '@/hooks/useCurrentPath';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  AdminDashboardRoutes,
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';

type CrumbConfig = {
  [x: string]: {
    title: string;
    parent?: string;
    icon?: SvgIconComponent;
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

const buildDefaultCrumbs = (
  routes:
    | typeof EnrollmentDashboardRoutes
    | typeof ClientDashboardRoutes
    | typeof ProjectDashboardRoutes
    | typeof AdminDashboardRoutes,
  overrides: CrumbConfig,
  defaultParent?: string
) => {
  const defaults: CrumbConfig = {};
  Object.keys(routes).forEach((key) => {
    const path = routes[key as keyof typeof routes];
    defaults[path] = {
      title: startCase(key.toLowerCase()),
      parent: path === defaultParent ? undefined : defaultParent,
    };
  });
  return merge(defaults, overrides);
};

export const useProjectBreadcrumbConfig = (
  context: ProjectDashboardContext | undefined
): CrumbConfig => {
  return useMemo(() => {
    if (context === undefined) {
      return {};
    }
    const overrides = {
      [ProjectDashboardRoutes.OVERVIEW]: {
        title: context.project.projectName,
      },
      [ProjectDashboardRoutes.PROJECT_ENROLLMENTS]: {
        title: 'Enrollments',
      },
      [ProjectDashboardRoutes.BULK_BED_NIGHTS]: {
        title: 'Bed Nights',
      },
      // TODO
      [ProjectDashboardRoutes.PROJECT_BED_NIGHTS_NEW_ENROLLMENT]: {
        title: 'Add Enrollment',
        parent: ProjectDashboardRoutes.BULK_BED_NIGHTS,
      },
      [ProjectDashboardRoutes.BULK_ASSIGN_SERVICE]: {
        title: 'Bulk Service Assignment',
      },
      [ProjectDashboardRoutes.ADD_HOUSEHOLD]: {
        title: 'Add Enrollment',
        parent: ProjectDashboardRoutes.PROJECT_ENROLLMENTS,
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
      },
      [ProjectDashboardRoutes.NEW_COC]: {
        title: 'Add CoC',
        parent: ProjectDashboardRoutes.COCS,
      },
      [ProjectDashboardRoutes.EDIT_COC]: {
        title: 'Edit CoC',
        parent: ProjectDashboardRoutes.COCS,
      },
      [ProjectDashboardRoutes.NEW_INVENTORY]: {
        title: 'Add Inventory',
        parent: ProjectDashboardRoutes.INVENTORY,
      },
      [ProjectDashboardRoutes.EDIT_INVENTORY]: {
        title: 'Update Inventory',
        parent: ProjectDashboardRoutes.INVENTORY,
      },
      [ProjectDashboardRoutes.HMIS_PARTICIPATION]: {
        title: 'HMIS Participation',
      },
      [ProjectDashboardRoutes.CE_PARTICIPATION]: {
        title: 'CE Participation',
      },
    };
    const projectRoot = ProjectDashboardRoutes.OVERVIEW;
    return buildDefaultCrumbs(ProjectDashboardRoutes, overrides, projectRoot);
  }, [context]);
};

export const useClientBreadcrumbConfig = (
  context: ClientDashboardContext | undefined
): CrumbConfig => {
  return useMemo(() => {
    if (!context) return {};

    const clientRoot = ClientDashboardRoutes.PROFILE;
    const overrides = {
      [ClientDashboardRoutes.PROFILE]: {
        title: clientBriefName(context.client),
      },
      [ClientDashboardRoutes.EDIT]: {
        title: 'Update Client Details',
      },
      [ClientDashboardRoutes.CLIENT_ENROLLMENTS]: {
        title: 'Enrollments',
      },
      [ClientDashboardRoutes.NEW_ENROLLMENT]: {
        title: 'Add Enrollment',
        parent: ClientDashboardRoutes.CLIENT_ENROLLMENTS,
      },
      [ClientDashboardRoutes.AUDIT_HISTORY]: {
        title: 'Client Audit History',
      },
      [ClientDashboardRoutes.NEW_MERGE]: {
        title: 'New Merge',
        parent: ClientDashboardRoutes.MERGE_HISTORY,
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
    return buildDefaultCrumbs(ClientDashboardRoutes, overrides, clientRoot);
  }, [context]);
};

export const useEnrollmentBreadcrumbConfig = (
  context: EnrollmentDashboardContext | undefined
): CrumbConfig => {
  return useMemo(() => {
    if (!context) return {};

    const clientRoot = ClientDashboardRoutes.PROFILE;
    const enrollmentRoot = EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW;
    const enrollmentTitle = context.enrollment
      ? enrollmentName(context.enrollment)
      : 'Enrollment';

    const overrides: CrumbConfig = {
      [clientRoot]: { title: clientBriefName(context.client) },
      [enrollmentRoot]: { parent: clientRoot, title: enrollmentTitle },
      [EnrollmentDashboardRoutes.EDIT_HOUSEHOLD]: { title: 'Edit Household' },
      [EnrollmentDashboardRoutes.CE_ASSESSMENTS]: { title: 'CE Assessments' },
      [EnrollmentDashboardRoutes.EVENTS]: { title: 'CE Events' },
      [EnrollmentDashboardRoutes.CUSTOM_CASE_NOTES]: { title: 'Case Notes' },
      [EnrollmentDashboardRoutes.VIEW_ASSESSMENT]: {
        title: 'Assessment',
        parent: EnrollmentDashboardRoutes.ASSESSMENTS,
      },
      [EnrollmentDashboardRoutes.NEW_ASSESSMENT]: {
        title: 'New Assessment',
        parent: EnrollmentDashboardRoutes.ASSESSMENTS,
      },
    };
    return buildDefaultCrumbs(
      EnrollmentDashboardRoutes,
      overrides,
      enrollmentRoot
    );
  }, [context]);
};

export const useAdminBreadcrumbConfig = (): CrumbConfig => {
  return useMemo(() => {
    // const root = Routes.ADMIN;
    const overrides = {
      [AdminDashboardRoutes.AC_DENIAL_DETAILS]: {
        title: 'Manage Denial',
        parent: AdminDashboardRoutes.AC_DENIALS,
      },
      [AdminDashboardRoutes.AC_DENIALS]: {
        title: 'Denials',
      },
      [AdminDashboardRoutes.PERFORM_CLIENT_MERGES]: {
        title: 'Potential Duplicates',
        parent: AdminDashboardRoutes.CLIENT_MERGE_HISTORY,
      },
      [AdminDashboardRoutes.CONFIGURE_SERVICES]: {
        title: 'Service Categories',
      },
      [AdminDashboardRoutes.CONFIGURE_SERVICE_CATEGORY]: {
        parent: AdminDashboardRoutes.CONFIGURE_SERVICES,
        title: 'View Service Category',
      },
      [AdminDashboardRoutes.VIEW_FORM]: {
        parent: AdminDashboardRoutes.FORMS,
        title: 'View Form Details',
      },
      [AdminDashboardRoutes.EDIT_FORM]: {
        parent: AdminDashboardRoutes.VIEW_FORM,
        title: 'Edit Form',
      },
      [AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY]: {
        parent: AdminDashboardRoutes.USERS,
        title: 'Audit User',
      },
      [AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY]: {
        parent: AdminDashboardRoutes.USERS,
        title: 'Audit User',
      },
      [AdminDashboardRoutes.USER_EDIT_HISTORY]: {
        parent: AdminDashboardRoutes.USERS,
        title: 'Audit User',
      },
      // [Routes.ADMIN]: {
      //   title: 'Admin',
      // },
    };
    return buildDefaultCrumbs(AdminDashboardRoutes, overrides);
  }, []);
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
      icon: crumbConfig[path]?.icon,
    }));

    return crumbs;
  }, [pathname, breadcrumbOverrides, crumbConfig, currentPath]);

  return breadcrumbs;
};
