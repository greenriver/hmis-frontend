import { Paper } from '@mui/material';
import React from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { ColumnDef } from '@/components/elements/table/types';
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
  unitName: {
    header: 'Unit',
    key: 'unit',
    render: ({ unit, name }) => unit?.name || name,
  },
  unitType: {
    header: 'Unit Type',
    key: 'unitType',
    render: ({ unit }) => unit?.unitType?.description,
  },
  unitGroup: {
    header: 'Unit Group',
    key: 'unitGroup',
    render: ({ unit }) => unit?.unitGroup?.name,
  },
  // TODO: eligible clients count
  dateAvailable: {
    header: 'Date Available',
    key: 'dateAvailable',
    render: ({ dateAvailable }) => (
      <DateWithRelativeTooltip dateString={dateAvailable} />
    ),
  },
};

const COLUMNS: ColumnDef<CeOpportunitySummaryFieldsFragment>[] = [
  OPPORTUNITY_COLUMNS.unitName,
  OPPORTUNITY_COLUMNS.dateAvailable,
];

interface Props {
  projectId: string;
}

const ProjectOpportunitiesTable: React.FC<Props> = ({ projectId }) => {
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
        noData='No available units'
        defaultPageSize={25}
        paginationItemName='unit'
        rowLinkTo={(row) =>
          generateSafePath(ProjectDashboardRoutes.CE_UNIT, {
            projectId,
            unitId: row.unit?.id,
          })
        }
        rowActionTitle='View Opportunity'
      />
    </Paper>
  );
};

export default ProjectOpportunitiesTable;
