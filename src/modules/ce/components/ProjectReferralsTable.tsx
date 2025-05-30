import { Paper } from '@mui/material';
import React from 'react';
import CommonTruncatedList from '@/components/elements/CommonTruncatedList';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  clientNameFromRecordWithOptionalClient,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStatus,
  CeReferralTableFieldsFragment,
  ClientCeReferralTableFieldsFragment,
  GetProjectCeReferralsDocument,
  GetProjectCeReferralsQuery,
  GetProjectCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const REFERRAL_COLUMNS: Record<
  string,
  ColumnDef<CeReferralTableFieldsFragment | ClientCeReferralTableFieldsFragment>
> = {
  client: {
    header: 'Client',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => clientNameFromRecordWithOptionalClient(referral),
    key: 'name',
    sticky: 'left',
  },
  opportunity: {
    header: 'Opportunity',
    key: 'opportunity',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => referral.opportunity.name,
  },
  date: {
    header: 'Referral Date',
    key: 'date',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => parseAndFormatDate(referral.createdAt),
  },
  status: {
    header: 'Status',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => <ReferralStatusChip status={referral.status} />,
    key: 'status',
  },
  currentSteps: {
    key: 'currentSteps',
    header: 'Current Task',
    render: (referral) => {
      if (!referral.currentSteps || referral.currentSteps.length === 0) return;
      return (
        <CommonTruncatedList
          items={referral.currentSteps?.map((s) => s.name)}
        />
      );
    },
  },
  referredBy: {
    header: 'Referred By',
    key: 'referredBy',
    render: (
      referral:
        | CeReferralTableFieldsFragment
        | ClientCeReferralTableFieldsFragment
    ) => referral.referredBy?.name,
  },
  // TODO(#7321) - add column for sending project
};

const COLUMNS: ColumnDef<CeReferralTableFieldsFragment>[] = [
  REFERRAL_COLUMNS.client,
  REFERRAL_COLUMNS.opportunity,
  REFERRAL_COLUMNS.date,
  REFERRAL_COLUMNS.status,
  REFERRAL_COLUMNS.currentSteps,
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
          generateSafePath(ProjectDashboardRoutes.REFERRAL, {
            projectId,
            referralId: referral.id,
          })
        }
        rowActionTitle='View Referral'
      />
    </Paper>
  );
};

export default ProjectReferralsTable;
