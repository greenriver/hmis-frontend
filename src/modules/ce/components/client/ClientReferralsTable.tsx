import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import { REFERRAL_COLUMNS } from '@/modules/ce/components/ProjectReferralsTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralAdminFieldsFragment,
  CeReferralStatus,
  ClientCeReferralTableFieldsFragment,
  GetClientCeReferralsDocument,
  GetClientCeReferralsQuery,
  GetClientCeReferralsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const REFERRAL_WITH_PROJECT_COLUMNS: {
  [key: string]: ColumnDef<
    ClientCeReferralTableFieldsFragment | CeReferralAdminFieldsFragment
  >;
} = {
  projectName: {
    header: 'Project Name',
    key: 'projectName',
    render: (referral: ClientCeReferralTableFieldsFragment) =>
      referral.targetProjectName,
  },
  projectType: {
    header: 'Project Type',
    key: 'projectType',
    render: (referral: ClientCeReferralTableFieldsFragment) => (
      <ProjectTypeChip projectType={referral.targetProjectType} />
    ),
  },
};

const COLUMNS: ColumnDef<ClientCeReferralTableFieldsFragment>[] = [
  { ...REFERRAL_COLUMNS.date, sticky: 'left' },
  REFERRAL_WITH_PROJECT_COLUMNS.projectName,
  REFERRAL_WITH_PROJECT_COLUMNS.projectType,
  REFERRAL_COLUMNS.status,
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
        rowLinkTo={(referral) =>
          generateSafePath(ProjectDashboardRoutes.REFERRAL, {
            projectId: referral.targetProjectId,
            opportunityId: referral.opportunity.id,
            referralId: referral.id,
          })
        }
        rowActionTitle='View Referral'
        filters={filters}
      />
    </Paper>
  );
};

export default ClientReferralsTable;
