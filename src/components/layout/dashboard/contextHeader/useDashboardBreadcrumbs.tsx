import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { ClientDashboardContext } from '@/components/pages/ClientDashboard';
import useCurrentPath from '@/hooks/useCurrentPath';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ClientDashboardRoutes, ProjectDashboardRoutes } from '@/routes/routes';

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

function isProjectContext(
  ctx: ClientDashboardContext | ProjectDashboardContext
): ctx is ProjectDashboardContext {
  return !!(
    typeof ctx === 'object' &&
    typeof (ctx as ProjectDashboardContext).project === 'object'
  );
}

export const useDashboardBreadcrumbs = (
  context: ClientDashboardContext | ProjectDashboardContext,
  breadcrumbOverrides?: Record<string, string>
) => {
  const crumbConfig: CrumbConfig = useMemo(() => {
    if (isProjectContext(context)) {
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
        [ProjectDashboardRoutes.REFERRALS]: {
          title: 'Referrals',
          parent: ProjectDashboardRoutes.OVERVIEW,
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
        [ProjectDashboardRoutes.MANAGE_INVENTORY_BEDS]: {
          title: 'Beds and Units',
          parent: ProjectDashboardRoutes.INVENTORY,
        },
      };
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
      [ClientDashboardRoutes.VIEW_ASSESSMENT]: {
        title: 'Assessment',
        parent: ClientDashboardRoutes.VIEW_ENROLLMENT,
      },
      [ClientDashboardRoutes.NEW_ASSESSMENT]: {
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
