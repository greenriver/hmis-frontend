import { Paper } from '@mui/material';
import React, { useCallback } from 'react';

import {
  REFERRAL_COLUMNS,
  REFERRAL_WITH_PROJECT_COLUMNS,
} from '@/modules/ce/referralColumns';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  CeReferralAdminFieldsFragment,
  CeReferralStatus,
  GetAdminCeReferralsDocument,
  GetAdminCeReferralsQuery,
  GetAdminCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: DataColumnDef<
  CeReferralAdminFieldsFragment,
  GetAdminCeReferralsQueryVariables
>[] = [
  REFERRAL_COLUMNS.client,
  REFERRAL_COLUMNS.status,
  REFERRAL_COLUMNS.currentSteps,
  REFERRAL_COLUMNS.daysOnCurrentTask,
  {
    ...REFERRAL_COLUMNS.currentTaskSwimlane,
    // FIXME(#7832): bug, defaultHidden: false not working
    // optional: {
    //   defaultHidden: false,
    // },
  },
  {
    ...REFERRAL_COLUMNS.currentTaskAssignees,
    optional: {
      defaultHidden: true,
    },
  },
  REFERRAL_WITH_PROJECT_COLUMNS.projectName,
  {
    ...REFERRAL_WITH_PROJECT_COLUMNS.projectType,
    optional: {
      defaultHidden: true,
    },
  },
  {
    key: 'organization',
    header: 'Organization',
    render: 'targetOrganizationName',
    optional: {
      defaultHidden: true,
    },
  },
  {
    header: 'Unit',
    key: 'unit',
    render: ({ opportunity }) => opportunity.unit?.name,
    optional: {
      defaultHidden: true,
      queryVariableField: 'includeUnit',
    },
  },
  { ...REFERRAL_COLUMNS.referredBy, optional: { defaultHidden: true } },
  REFERRAL_COLUMNS.date,
  {
    key: 'updatedBy',
    header: 'Last Updated By',
    render: ({ updatedBy }) => updatedBy?.name,
    // optional: {
    //   defaultHidden: false,
    // },
  },
];
interface Props {}
const AdminReferralsTable: React.FC<Props> = ({}) => {
  const filters = useFilters({
    type: 'CeReferralFilterOptions',
  });

  const rowSecondaryActions = useCallback(
    (row: CeReferralAdminFieldsFragment) => {
      const actions = [];

      if (row.client) {
        // If client is not present, this user doesn't have permission to view
        actions.push({
          key: 'client',
          title: 'View Client Profile',
          to: generateSafePath(ClientDashboardRoutes.PROFILE, {
            clientId: row.client.id,
          }),
        });

        if (row.targetEnrollment) {
          // link to target enrollment if it exists
          actions.push({
            key: 'enrollment',
            title: 'View Enrollment',
            to: generateSafePath(
              EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
              {
                clientId: row.client.id,
                enrollmentId: row.targetEnrollment.id,
              }
            ),
          });
        }
      }

      actions.push({
        key: 'project',
        title: 'View Project',
        to: generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
          projectId: row.targetProjectId,
        }),
      });

      return actions;
    },
    []
  );

  return (
    <Paper>
      <GenericTableWithData<
        GetAdminCeReferralsQuery,
        GetAdminCeReferralsQueryVariables,
        CeReferralAdminFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{}}
        defaultFilterValues={{
          referralStatus: [
            CeReferralStatus.Initialized,
            CeReferralStatus.InProgress,
          ],
        }}
        queryDocument={GetAdminCeReferralsDocument}
        pagePath='ceReferrals'
        noData='No referrals'
        paginationItemName='referrals'
        filters={filters}
        rowLinkTo={(row) =>
          generateSafePath(ProjectDashboardRoutes.REFERRAL, {
            projectId: row.targetProjectId,
            referralId: row.id,
          })
        }
        rowActionTitle='View Referral'
        rowSecondaryActionConfigs={rowSecondaryActions}
      />
    </Paper>
  );
};

export default AdminReferralsTable;
