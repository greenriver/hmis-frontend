import { Chip, Paper, Tooltip } from '@mui/material';
import pluralize from 'pluralize';
import React from 'react';

import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
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
  {
    key: 'candidateCreatedAt',
    // Date when client became eligible for the pool (not tied to availability)
    header: (
      <Tooltip
        title='Date when the client became eligible'
        placement='top'
        arrow
      >
        <span>Date Added</span>
      </Tooltip>
    ),
    render: ({ candidateCreatedAt }) => {
      if (!candidateCreatedAt) return '';
      return <RelativeDateDisplay dateString={candidateCreatedAt} />;
    },
  },
];

interface Props {
  ceClientId: string;
}
const CeClientEligibleUnitGroupsTable: React.FC<Props> = ({ ceClientId }) => {
  const filters = useFilters({
    type: 'CeEligibleUnitGroupFilterOptions',
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
