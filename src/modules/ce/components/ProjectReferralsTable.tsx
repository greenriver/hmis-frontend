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

export const REFERRAL_COLUMNS: Record<
  string,
  ColumnDef<CeReferralTableFieldsFragment>
> = {
  client: {
    header: 'Client',
    render: (referral: CeReferralTableFieldsFragment) =>
      clientNameFromRecordWithOptionalClient(referral),
    key: 'name',
    sticky: 'left',
  },
  opportunity: {
    header: 'Opportunity',
    key: 'opportunity',
    render: (referral: CeReferralTableFieldsFragment) =>
      referral.opportunity.name,
  },
  date: {
    header: 'Referral Date',
    key: 'date',
    render: (referral: CeReferralTableFieldsFragment) => (
      <RelativeDateDisplay dateString={referral.createdAt} />
    ),
  },
  status: {
    header: 'Status',
    render: (referral: CeReferralTableFieldsFragment) => (
      <ReferralStatusChip status={referral.status} />
    ),
    key: 'status',
  },
  step: {
    header: 'Current Step',
    key: 'step',
    render: (referral: CeReferralTableFieldsFragment) =>
      referral.currentStepName,
  },
  referredBy: {
    header: 'Referred By',
    key: 'referredBy',
    render: (referral: CeReferralTableFieldsFragment) =>
      referral.referredBy?.name,
  },
  // TODO(#7321) - add column for sending project
};

const COLUMNS: ColumnDef<CeReferralTableFieldsFragment>[] = [
  REFERRAL_COLUMNS.client,
  REFERRAL_COLUMNS.opportunity,
  REFERRAL_COLUMNS.date,
  REFERRAL_COLUMNS.status,
  REFERRAL_COLUMNS.step,
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
