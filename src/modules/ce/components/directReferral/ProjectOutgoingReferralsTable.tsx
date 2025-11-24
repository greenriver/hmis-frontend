import { Paper } from '@mui/material';
import React from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import { getReferralLink } from '@/modules/ce/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  CeOutgoingReferralsTableFieldsFragment,
  GetProjectOutgoingDirectCeReferralsDocument,
  GetProjectOutgoingDirectCeReferralsQuery,
  GetProjectOutgoingDirectCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: DataColumnDef<
  CeOutgoingReferralsTableFieldsFragment,
  GetProjectOutgoingDirectCeReferralsQueryVariables
>[] = [
  {
    header: 'Client',
    render: 'clientName',
    key: 'name',
    sticky: 'left',
  },
  {
    header: 'Status',
    render: (referral) => (
      <ReferralStatusChip referral={referral} size='small' />
    ),
    key: 'status',
  },
  {
    header: 'Target Project',
    render: (referral) => referral.targetProjectName,
    key: 'project',
  },
  {
    header: 'Referred By',
    render: (referral) => referral.referredBy?.name,
    key: 'referredBy',
    optional: {
      defaultHidden: true,
    },
  },
  {
    header: 'Referred At',
    key: 'createdAt',
    render: ({ createdAt }) => (
      <DateWithRelativeTooltip dateString={createdAt} />
    ),
  },
];

interface Props {
  projectId: string;
}

/**
 * Table showing outgoing referrals from a project.
 */
const ProjectOutgoingReferralsTable: React.FC<Props> = ({ projectId }) => {
  const filters = useFilters({
    type: 'ProjectOutgoingCeReferralFilterOptions',
  });

  return (
    <Paper>
      <GenericTableWithData<
        GetProjectOutgoingDirectCeReferralsQuery,
        GetProjectOutgoingDirectCeReferralsQueryVariables,
        CeOutgoingReferralsTableFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          id: projectId,
        }}
        filters={filters}
        queryDocument={GetProjectOutgoingDirectCeReferralsDocument}
        pagePath='project.outgoingDirectCeReferrals'
        noData='No referrals'
        paginationItemName='outgoing referrals'
        rowLinkTo={(referral) => {
          if (referral.access.canViewReferralDetails) {
            return getReferralLink(referral);
          }
        }}
        rowActionTitle='View Referral'
        rowSecondaryActionConfigs={(
          referral: CeOutgoingReferralsTableFieldsFragment
        ) => {
          const actions = [];

          if (referral.client) {
            actions.push(getViewClientMenuItem(referral.client));
          }

          if (referral.access.canViewSourceEnrollmentDetails) {
            actions.push({
              title: 'View Enrollment',
              key: 'enrollment',
              ariaLabel: `View Source Enrollment for ${referral.clientName}`,
              to: generateSafePath(
                EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                {
                  clientId: referral.clientId,
                  enrollmentId: referral.sourceEnrollmentId,
                }
              ),
            });
          }

          return actions;
        }}
      />
    </Paper>
  );
};

export default ProjectOutgoingReferralsTable;
