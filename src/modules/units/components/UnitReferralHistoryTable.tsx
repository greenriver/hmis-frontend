import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import { REFERRAL_COLUMNS } from '@/modules/ce/referralColumns';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralBaseTableFieldsFragment,
  GetUnitCeReferralsDocument,
  GetUnitCeReferralsQuery,
  GetUnitCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<CeReferralBaseTableFieldsFragment>[] = [
  REFERRAL_COLUMNS.client,
  REFERRAL_COLUMNS.status,
  REFERRAL_COLUMNS.referredBy,
  REFERRAL_COLUMNS.date,
  REFERRAL_COLUMNS.updatedDate,
  REFERRAL_COLUMNS.origin,
];

interface Props {
  projectId: string;
  unitId: string;
  unitName: string;
  breadcrumbParentRoute: string;
}

const UnitReferralHistoryTable: React.FC<Props> = ({
  projectId,
  unitId,
  unitName,
  breadcrumbParentRoute,
}) => {
  return (
    <Paper>
      <GenericTableWithData<
        GetUnitCeReferralsQuery,
        GetUnitCeReferralsQueryVariables,
        CeReferralBaseTableFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          id: unitId,
        }}
        queryDocument={GetUnitCeReferralsDocument}
        pagePath='unit.ceReferrals'
        noData='No referrals'
        paginationItemName='referrals'
        rowLinkTo={(referral) =>
          generateSafePath(ProjectDashboardRoutes.REFERRAL, {
            projectId,
            referralId: referral.id,
          })
        }
        rowLinkState={{
          projectReferralBreadcrumbParent: {
            route: breadcrumbParentRoute,
            routeParams: { projectId, unitId },
            title: unitName,
          },
        }}
        rowName={(referral) => `Referral for ${referral.clientName}`}
        rowActionTitle='View Referral'
      />
    </Paper>
  );
};

export default UnitReferralHistoryTable;
