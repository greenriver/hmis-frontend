import { Paper } from '@mui/material';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  CeOutgoingReferralsTableFieldsFragment,
  GetProjectOutgoingCeReferralsDocument,
  GetProjectOutgoingCeReferralsQuery,
  GetProjectOutgoingCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: DataColumnDef<
  CeOutgoingReferralsTableFieldsFragment,
  GetProjectOutgoingCeReferralsQueryVariables
>[] = [
  {
    header: 'Client',
    render: (referral) => clientNameFromRecordWithOptionalClient(referral),
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
];

interface Props {
  projectId: string;
}

/**
 * Table showing outgoing referrals from a project.
 */
const ProjectOutgoingReferralsTable: React.FC<Props> = ({ projectId }) => {
  const filters = useFilters({
    type: 'CeReferralFilterOptions',
    omit: ['onCurrentTaskSince', 'workflowTemplate'],
  });

  return (
    <Paper>
      <GenericTableWithData<
        GetProjectOutgoingCeReferralsQuery,
        GetProjectOutgoingCeReferralsQueryVariables,
        CeOutgoingReferralsTableFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          id: projectId,
        }}
        filters={filters}
        queryDocument={GetProjectOutgoingCeReferralsDocument}
        pagePath='project.outgoingCeReferrals'
        noData='No referrals'
        paginationItemName='referrals'
        rowLinkTo={(referral) => {
          if (referral.access.canViewReferralDetails) {
            return generateSafePath(ProjectDashboardRoutes.REFERRAL, {
              projectId: referral.targetProjectId,
              referralId: referral.id,
            });
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

          const enrollment = referral.sourceEnrollment;

          if (
            enrollment?.dataSource.isCurrentDataSource &&
            enrollment?.access.canViewEnrollmentDetails
          ) {
            actions.push({
              title: 'View Enrollment',
              key: 'enrollment',
              ariaLabel: `View Source Enrollment for ${clientNameFromRecordWithOptionalClient(referral)}`,
              to: generateSafePath(
                EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                {
                  clientId: enrollment.sourceClientId,
                  enrollmentId: enrollment.id,
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
