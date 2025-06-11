import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import { REFERRAL_COLUMNS } from '@/modules/ce/referralColumns';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
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
  REFERRAL_COLUMNS.client,
  REFERRAL_COLUMNS.status,
  REFERRAL_COLUMNS.currentSteps,
  REFERRAL_COLUMNS.daysOnCurrentTask,
  REFERRAL_COLUMNS.currentTaskSwimlane,
  REFERRAL_COLUMNS.date,
  REFERRAL_COLUMNS.opportunity,
];

interface Props {}
const ProjectReferralsTable: React.FC<Props> = ({}) => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  const filters = useFilters({
    type: 'CeReferralFilterOptions',
    omit: ['organization', 'project', 'projectType', 'workflowTemplate'],
  });

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
          // filters: {
          //   status: [CeReferralStatus.Initialized, CeReferralStatus.InProgress],
          // },
        }}
        defaultFilterValues={{
          status: [CeReferralStatus.Initialized, CeReferralStatus.InProgress],
        }}
        filters={filters}
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
