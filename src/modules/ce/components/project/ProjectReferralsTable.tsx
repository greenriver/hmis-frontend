import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import { useFilters } from '@/hooks/useTableFilters';
import { REFERRAL_COLUMNS } from '@/modules/ce/referralColumns';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
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

interface Props {
  projectId: string;
}

/**
 * Table showing referrals to a specific project.
 *
 * If user has "canViewReferrals", then they will be able to see ALL referrals to the project.
 * If user has "canViewOwnReferrals", then they will only be able to see referrals that have an available task assigned to them.
 */
const ProjectReferralsTable: React.FC<Props> = ({ projectId }) => {
  const filters = useFilters({
    type: 'ProjectCeReferralFilterOptions',
    omit: ['searchTerm'],
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
