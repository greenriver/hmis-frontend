import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';

import {
  REFERRAL_COLUMNS,
  REFERRAL_WITH_PROJECT_COLUMNS,
} from '@/modules/ce/referralColumns';
import { getReferralLink } from '@/modules/ce/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  ClientCeReferralTableFieldsFragment,
  GetClientCeReferralsDocument,
  GetClientCeReferralsQuery,
  GetClientCeReferralsQueryVariables,
} from '@/types/gqlTypes';

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
    omit: ['workflowTemplate'],
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
