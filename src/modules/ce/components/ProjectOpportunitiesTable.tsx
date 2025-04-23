import { Chip, Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeOpportunityStatus,
  CeOpportunitySummaryFieldsFragment,
  GetProjectCeOpportunitiesDocument,
  GetProjectCeOpportunitiesQuery,
  GetProjectCeOpportunitiesQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const OPPORTUNITY_COLUMNS: Record<
  string,
  ColumnDef<CeOpportunitySummaryFieldsFragment>
> = {
  name: {
    header: 'Opportunity',
    key: 'name',
    sticky: 'left',
    render: 'name',
  },
  type: {
    header: 'Type',
    key: 'type',
    render: (row) => {
      return row.categories.map((category) => (
        <Chip key={category} size='small' variant='outlined' label={category} />
      ));
    },
  },
};

const COLUMNS: ColumnDef<CeOpportunitySummaryFieldsFragment>[] = [
  OPPORTUNITY_COLUMNS.name,
  OPPORTUNITY_COLUMNS.type,
];

interface Props {}
const ProjectOpportunitiesTable: React.FC<Props> = ({}) => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <Paper>
      <GenericTableWithData<
        GetProjectCeOpportunitiesQuery,
        GetProjectCeOpportunitiesQueryVariables,
        CeOpportunitySummaryFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          id: projectId,
          filters: {
            status: [CeOpportunityStatus.Open],
          },
        }}
        queryDocument={GetProjectCeOpportunitiesDocument}
        pagePath='project.ceOpportunities'
        noData='No opportunities'
        paginationItemName='opportunities'
        rowLinkTo={(row) =>
          generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
            projectId,
            opportunityId: row.id,
          })
        }
        rowActionTitle='View Opportunity'
      />
    </Paper>
  );
};

export default ProjectOpportunitiesTable;
