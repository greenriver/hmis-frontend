import { Chip, Paper } from '@mui/material';
import pluralize from 'pluralize';
import React from 'react';

import useTableFilters from '@/hooks/useTableFilters';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeEligibleUnitGroupFieldsFragment,
  GetCeClientEligibleUnitGroupsDocument,
  GetCeClientEligibleUnitGroupsQuery,
  GetCeClientEligibleUnitGroupsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type Row = CeEligibleUnitGroupFieldsFragment;

const COLUMNS: DataColumnDef<
  Row,
  GetCeClientEligibleUnitGroupsQueryVariables
>[] = [
  {
    key: 'organizationName',
    header: 'Organization',
    render: 'organizationName',
  },
  {
    key: 'projectName',
    header: 'Project',
    render: 'projectName',
  },
  {
    header: 'Project Type',
    key: 'projectType',
    render: ({ projectType }) => <ProjectTypeChip projectType={projectType} />,
  },
  {
    key: 'unitGroupName',
    header: 'Unit Group',
    render: 'unitGroupName',
  },
  {
    key: 'vacancies',
    header: 'Availability',
    render: ({ unitsAcceptingReferrals }) => (
      <Chip
        label={`${unitsAcceptingReferrals} ${pluralize('Unit', unitsAcceptingReferrals)} Accepting Referrals`}
        color={unitsAcceptingReferrals > 0 ? 'primary' : 'grayscale'}
        size='small'
        variant='status'
      />
    ),
  },
];

interface Props {
  ceClientId: string;
}
const CeClientEligibleUnitGroupsTable: React.FC<Props> = ({ ceClientId }) => {
  const { filters } = useTableFilters({
    type: 'CeEligibleUnitGroupFilterOptions',
    syncToUrl: false, // don't sync filters to URL because this table is used in a dialog
  });

  return (
    <Paper>
      <GenericTableWithData<
        GetCeClientEligibleUnitGroupsQuery,
        GetCeClientEligibleUnitGroupsQueryVariables,
        Row
      >
        columns={COLUMNS}
        queryVariables={{ id: ceClientId }}
        queryDocument={GetCeClientEligibleUnitGroupsDocument}
        pagePath='ceClient.eligibleUnitGroups'
        noData='No eligible projects found'
        paginationItemName='record'
        filters={filters}
        defaultPageSize={10}
        loadingVariant='linear'
        rowSecondaryActionConfigs={({ projectId, projectName }) => [
          {
            title: 'View Project',
            key: 'project',
            ariaLabel: `View Project, ${projectName}`,
            to: generateSafePath(ProjectDashboardRoutes.CE, { projectId }),
          },
        ]}
      />
    </Paper>
  );
};

export default CeClientEligibleUnitGroupsTable;
