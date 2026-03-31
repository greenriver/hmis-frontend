import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';

import { useFilters } from '@/hooks/useTableFilters';
import {
  REFERRAL_COLUMNS,
  REFERRAL_WITH_PROJECT_COLUMNS,
} from '@/modules/ce/referralColumns';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { Routes } from '@/routes/routes';
import {
  ClientCeReferralTableFieldsFragment,
  GetClientCeReferralsDocument,
  GetClientCeReferralsQuery,
  GetClientCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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

  const filters = useFilters({ type: 'ClientCeReferralFilterOptions' });

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
        rowLinkTo={({ id }) =>
          generateSafePath(Routes.REFERRAL, {
            referralId: id,
          })
        }
        rowActionTitle='View Referral'
        filters={filters}
      />
    </Paper>
  );
};

export default ClientReferralsTable;
