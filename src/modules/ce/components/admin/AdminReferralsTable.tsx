import { Paper } from '@mui/material';
import { formatDistanceToNowStrict } from 'date-fns';
import React, { useCallback } from 'react';
import { REFERRAL_WITH_PROJECT_COLUMNS } from '@/modules/ce/components/client/ClientReferralsTable';
import { REFERRAL_COLUMNS } from '@/modules/ce/components/ProjectReferralsTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseHmisDateString } from '@/modules/hmis/hmisUtil';
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
  {
    // TODO - no ticket yet, but we will discuss this with design and probably make updates.
    // Ideally this column "Time in Current Step" should correspond with the filter "On Current Step Since..."
    // aka, they should have the same title and use the same unit (days)
    key: 'timeInCurrentStep',
    header: 'Time in Current Step',
    render: (row) => {
      if (!row.currentStepTime) return;

      const parsed = parseHmisDateString(row.currentStepTime);
      if (!parsed) return row.currentStepTime;

      return formatDistanceToNowStrict(parsed);
    },
  },
  REFERRAL_WITH_PROJECT_COLUMNS.projectName,
  REFERRAL_WITH_PROJECT_COLUMNS.projectType,
  {
    key: 'organization',
    header: 'Organization',
    render: 'targetOrganizationName',
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
  REFERRAL_COLUMNS.referredBy,
  {
    key: 'updatedBy',
    header: 'Last Updated By',
    render: ({ updatedBy }) => updatedBy?.name,
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
          status: [CeReferralStatus.Initialized, CeReferralStatus.InProgress],
        }}
        queryDocument={GetAdminCeReferralsDocument}
        pagePath='ceReferrals'
        noData='No referrals'
        paginationItemName='referrals'
        filters={filters}
        rowLinkTo={(row) =>
          generateSafePath(ProjectDashboardRoutes.REFERRAL_DETAILS, {
            projectId: row.targetProjectId,
            opportunityId: row.opportunity.id,
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
