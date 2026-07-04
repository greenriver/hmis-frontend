import { Paper } from '@mui/material';
import React from 'react';
import useTableFilters from '@/hooks/useTableFilters';
import useTablePagination from '@/hooks/useTablePagination';
import { OPPORTUNITY_COLUMNS } from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
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

const COLUMNS: DataColumnDef<
  CeOpportunityAdminFieldsFragment,
  GetAdminCeOpportunitiesQueryVariables
>[] = [
  { ...OPPORTUNITY_COLUMNS.dateAvailable, sticky: 'left' },
  {
    header: 'Organization',
    key: 'organization',
    render: 'organizationName',
  },
  {
    header: 'Project',
    key: 'project',
    render: 'projectName',
  },
  {
    header: 'Project Type',
    key: 'projectType',
    render: ({ projectType }) => <ProjectTypeChip projectType={projectType} />,
    optional: {
      defaultHidden: true,
    },
  },
  OPPORTUNITY_COLUMNS.unitName,
  {
    ...OPPORTUNITY_COLUMNS.unitType,
    optional: {
      defaultHidden: true,
    },
  },
  {
    ...OPPORTUNITY_COLUMNS.unitGroup,
    optional: {
      defaultHidden: true,
    },
  },
];

interface Props {
  projectGroupId?: string;
}
const AdminOpportunitiesTable: React.FC<Props> = ({ projectGroupId }) => {
  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'CeOpportunityFilterOptions',
    omit: [
      'status', // omitted because only 'open' opportunities are queried
      'availableOnDate', // omitted because filter is not implemented on the backend #7537
      'projectGroupId', // only exposed via Workspaces
    ],
  });
  const pagination = useTablePagination({
    pageParam: 'availableUnitsPage',
    pageSizeParam: 'availableUnitsPageSize',
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
            projectGroupId,
          },
        }}
        defaultSortOption={CeOpportunitySortOption.DateAvailableEarliestFirst}
        queryDocument={GetAdminCeOpportunitiesDocument}
        recordType='CeOpportunity'
        pagePath='ceOpportunities'
        noData='No available units'
        paginationItemName='available unit'
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        pagination={pagination}
        rowLinkTo={(row) =>
          // Link to Unit Page. If the project doesn't support waitlists, this will redirect to the All Units page.
          generateSafePath(ProjectDashboardRoutes.UNIT, {
            projectId: row.projectId,
            unitId: row.unit?.id,
          })
        }
        rowActionTitle='View Unit'
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
