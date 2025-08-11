import { Chip, Paper } from '@mui/material';
import React from 'react';

import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  CeUnitGroupCandidateFieldsFragment,
  GetCeClientEligibleUnitGroupsDocument,
  GetCeClientEligibleUnitGroupsQuery,
  GetCeClientEligibleUnitGroupsQueryVariables,
} from '@/types/gqlTypes';

type Row = CeUnitGroupCandidateFieldsFragment;

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
    render: (row) => (
      <Chip
        // label={`${row.vacancies}/${row.capacity} Units Accepting Referrals`}
        label={`${row.vacancies} Units Accepting Referrals`}
        color={row.vacancies > 0 ? 'primary' : 'grayscale'}
        size='small'
        variant='status'
      />
    ),
  },
  {
    key: 'whenAddedToCandidatePool',
    header: 'Added to Waitlist', // "became eligible"? waitlist!= vacancy
    render: ({ whenAddedToCandidatePool }) => {
      if (!whenAddedToCandidatePool) return '';
      return <RelativeDateDisplay dateString={whenAddedToCandidatePool} />;
    },
  },
];

interface Props {
  id: string;
}
const CeClientEligibleUnitGroupsTable: React.FC<Props> = ({ id }) => {
  // TODO: support filtering by project type
  // const filters = useFilters({
  //   type: 'CeReferralFilterOptions',
  //   omit: ['workflowTemplate'],
  // });

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
        pagePath='ceConsolidatedWaitlist.ceClient.unitGroupsCandidates'
        noData='No eligible projects found'
        paginationItemName='record'
        // filters={filters}
        // rowActionTitle='View Waitlist' // nav to unit group waitlist?
        // rowSecondaryActionConfigs={rowSecondaryActions}
      />
    </Paper>
  );
};

export default CeClientEligibleUnitGroupsTable;
