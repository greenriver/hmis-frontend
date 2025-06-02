import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import { REFERRAL_COLUMNS } from '@/modules/ce/components/project/ProjectReferralsTable';
import { getReferralLink } from '@/modules/ce/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  CeReferralStatus,
  CeReferralWithProjectFieldsFragment,
  ClientCeReferralTableFieldsFragment,
  GetClientCeReferralsDocument,
  GetClientCeReferralsQuery,
  GetClientCeReferralsQueryVariables,
} from '@/types/gqlTypes';

export const REFERRAL_WITH_PROJECT_COLUMNS: {
  [key: string]: ColumnDef<CeReferralWithProjectFieldsFragment>;
} = {
  projectName: {
    header: 'Project Name',
    key: 'projectName',
    render: (referral: CeReferralWithProjectFieldsFragment) =>
      referral.targetProjectName,
  },
  projectType: {
    header: 'Project Type',
    key: 'projectType',
    render: (referral: CeReferralWithProjectFieldsFragment) => (
      <ProjectTypeChip projectType={referral.targetProjectType} />
    ),
  },
};

const COLUMNS: ColumnDef<ClientCeReferralTableFieldsFragment>[] = [
  { ...REFERRAL_WITH_PROJECT_COLUMNS.projectName, sticky: 'left' },
  REFERRAL_COLUMNS.date,
  REFERRAL_COLUMNS.status,
  REFERRAL_WITH_PROJECT_COLUMNS.projectType,
  REFERRAL_COLUMNS.referredBy,
  REFERRAL_COLUMNS.currentSteps,
];

const ClientReferralsTable: React.FC = () => {
  const { clientId } = useSafeParams() as {
    clientId: string;
  };

  const filters = useFilters({
    type: 'CeReferralFilterOptions',
  });

  return (
    <Paper>
      <GenericTableWithData<
        GetClientCeReferralsQuery,
        GetClientCeReferralsQueryVariables,
        ClientCeReferralTableFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          id: clientId,
        }}
        defaultFilterValues={{
          status: [CeReferralStatus.Initialized, CeReferralStatus.InProgress],
        }}
        queryDocument={GetClientCeReferralsDocument}
        pagePath='client.ceReferrals'
        noData='No referrals'
        paginationItemName='referrals'
        rowLinkTo={getReferralLink}
        rowActionTitle='View Referral'
        filters={filters}
      />
    </Paper>
  );
};

export default ClientReferralsTable;
