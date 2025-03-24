import { Paper } from '@mui/material';
import React from 'react';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStatus,
  CeReferralTableFieldsFragment,
  GetProjectCeReferralsDocument,
  GetProjectCeReferralsQuery,
  GetProjectCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<CeReferralTableFieldsFragment>[] = [
  {
    header: 'Client',
    render: (referral) => clientNameFromRecordWithOptionalClient(referral),
    key: 'name',
    sticky: 'left',
  },
  {
    header: 'Opportunity',
    key: 'opportunity',
    render: (referral) => referral.opportunity.name,
  },
  {
    header: 'Started',
    key: 'started',
    render: (referral) => (
      <RelativeDateDisplay
        preciseTime={false}
        dateString={referral.dateStarted}
      />
    ),
  },
  {
    header: 'Status',
    render: (referral) => <ReferralStatusChip status={referral.status} />,
    key: 'status',
  },
  {
    header: 'Current Step',
    key: 'step',
    render: (referral) => referral.currentStep?.name,
  },
  // TODO(#7321) - add column for sending project here
];

interface Props {}
const ProjectReferralsTable: React.FC<Props> = ({}) => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <Paper>
      <GenericTableWithData<
        GetProjectCeReferralsQuery,
        GetProjectCeReferralsQueryVariables,
        CeReferralTableFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          id: projectId,
          filters: {
            status: [CeReferralStatus.Initialized, CeReferralStatus.InProgress],
          },
        }}
        queryDocument={GetProjectCeReferralsDocument}
        pagePath='project.ceReferrals'
        noData='No referrals'
        paginationItemName='referrals'
        rowLinkTo={(referral) =>
          generateSafePath(ProjectDashboardRoutes.REFERRAL_DETAILS, {
            projectId,
            opportunityId: referral.opportunity.id,
            referralId: referral.id,
          })
        }
        rowActionTitle='View Referral'
      />
    </Paper>
  );
};

export default ProjectReferralsTable;
