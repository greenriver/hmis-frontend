import { Paper } from '@mui/material';
import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import { OPPORTUNITY_COLUMNS } from '@/modules/ce/components/project/ProjectOpportunitiesTable';
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
  {
    header: 'Project',
    key: 'project',
    sticky: 'left',
    render: 'projectName',
  },
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
  OPPORTUNITY_COLUMNS.unitName,
  OPPORTUNITY_COLUMNS.dateAvailable,
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
        noData='No available units'
        paginationItemName='unit'
        filters={filters}
        defaultFilterValues={{
          status: [CeOpportunityStatus.Open],
        }}
        rowLinkTo={(row) =>
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
