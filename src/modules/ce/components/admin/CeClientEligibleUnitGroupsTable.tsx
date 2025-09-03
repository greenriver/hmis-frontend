import { Chip, Paper, Tooltip } from '@mui/material';
import React from 'react';

import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  CeEligibleUnitGroupFieldsFragment,
  GetCeClientEligibleUnitGroupsDocument,
  GetCeClientEligibleUnitGroupsQuery,
  GetCeClientEligibleUnitGroupsQueryVariables,
} from '@/types/gqlTypes';

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
        // label={`${row.vacancies}/${row.capacity} Units Accepting Referrals`}
        label={`${unitsAcceptingReferrals} Units Accepting Referrals`}
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
  id: string;
}
const CeClientEligibleUnitGroupsTable: React.FC<Props> = ({ id }) => {
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
        queryVariables={{ id }}
        queryDocument={GetCeClientEligibleUnitGroupsDocument}
        pagePath='ceClient.eligibleUnitGroups'
        noData='No eligible projects found'
        paginationItemName='record'
        filters={filters}
        // rowActionTitle='View Waitlist' // nav to unit group waitlist?
        // rowSecondaryActionConfigs={rowSecondaryActions}
      />
    </Paper>
  );
};

export default CeClientEligibleUnitGroupsTable;
