import { Paper } from '@mui/material';
import React from 'react';
import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { ColumnDef } from '@/components/elements/table/types';
import { OPPORTUNITY_COLUMNS } from '@/modules/ce/components/ProjectOpportunitiesTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeOpportunityAdminFieldsFragment,
  CeOpportunitySortOption,
  CeOpportunityStatus,
  GetAdminCeOpportunitiesDocument,
  GetAdminCeOpportunitiesQuery,
  GetAdminCeOpportunitiesQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<CeOpportunityAdminFieldsFragment>[] = [
  OPPORTUNITY_COLUMNS.project,
  {
    header: 'Project Type',
    key: 'projectType',
    render: ({ projectType }) => <ProjectTypeChip projectType={projectType} />,
  },
  {
    header: 'Organization',
    key: 'organization',
    render: 'organizationName',
  },
  {
    header: 'Unit',
    key: 'unit',
    render: ({ unit }) => unit?.name,
  },
  {
    header: 'Date Available',
    key: 'dateAvailable',
    render: ({ dateAvailable }) => {
      if (dateAvailable)
        return <DateWithRelativeTooltip dateString={dateAvailable} />;
      return 'Available now';
    },
  },
];

interface Props {}
const AdminOpportunitiesTable: React.FC<Props> = ({}) => {
  const filters = useFilters({
    type: 'CeOpportunityFilterOptions',
    omit: ['status'],
  });

  return (
    <Paper>
      <GenericTableWithData<
        GetAdminCeOpportunitiesQuery,
        GetAdminCeOpportunitiesQueryVariables,
        CeOpportunityAdminFieldsFragment
      >
        columns={COLUMNS}
        queryVariables={{
          filters: {
            status: [CeOpportunityStatus.Open],
          },
        }}
        defaultSortOption={CeOpportunitySortOption.DateAvailableEarliestFirst}
        queryDocument={GetAdminCeOpportunitiesDocument}
        recordType='CeOpportunity'
        pagePath='ceOpportunities'
        noData='No opportunities'
        paginationItemName='opportunities'
        filters={filters}
        defaultFilterValues={{
          status: [CeOpportunityStatus.Open],
        }}
        rowLinkTo={(row) =>
          generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
            projectId: row.projectId,
            opportunityId: row.id,
          })
        }
        rowActionTitle='View Opportunity'
        rowSecondaryActionConfigs={(row) => [
          {
            key: 'project',
            title: 'View Project',
            to: generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
              projectId: row.projectId,
            }),
          },
        ]}
      />
    </Paper>
  );
};

export default AdminOpportunitiesTable;
