import { Badge, Chip, Paper, Stack } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import {
  GetAdminConsolidatedWaitlistDocument,
  GetAdminConsolidatedWaitlistQuery,
  GetAdminConsolidatedWaitlistQueryVariables,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

type Row = NonNullable<
  GetAdminConsolidatedWaitlistQuery['consolidatedWaitlist']
>['nodes'][0];

const COLUMNS: DataColumnDef<
  Row,
  GetAdminConsolidatedWaitlistQueryVariables
>[] = [
  // {
  //   key: 'clientId',
  //   header: 'Client ID',
  //   render: 'clientId',
  // },
  {
    key: 'clientName',
    header: 'Client Name',
    render: 'clientName',
  },
  {
    key: 'projectName',
    header: 'Project',
    render: 'projectName',
  },
  {
    key: 'unitGroupName',
    header: 'Unit Group',
    render: 'unitGroupName',
  },

  // {
  //   key: 'projectId',
  //   header: 'Project ID',
  //   render: 'projectId',
  // },
  {
    key: 'organizationName',
    header: 'Organization',
    render: 'organizationName',
    optional: { defaultHidden: true },
  },
  {
    key: 'whenAddedToCandidatePool',
    header: 'Added to Candidate Pool',
    render: ({ whenAddedToCandidatePool }) =>
      whenAddedToCandidatePool
        ? parseAndFormatDateTime(whenAddedToCandidatePool)
        : '',
    optional: { defaultHidden: false },
  },
  {
    key: 'whenUpdatedInCandidatePool',
    header: 'Updated in Candidate Pool',
    render: ({ whenUpdatedInCandidatePool }) =>
      whenUpdatedInCandidatePool
        ? parseAndFormatDateTime(whenUpdatedInCandidatePool)
        : '',
    optional: { defaultHidden: false },
  },
  {
    key: 'priorityScore',
    header: 'Priority Score',
    render: 'priorityScore',
  },
  {
    key: 'clientAge',
    header: 'Client Age',
    render: 'clientAge',
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip
        label={
          row.clientAge !== 50
            ? 'Eligible - Vacancies Available'
            : 'Eligible - No Vacancies'
        }
        color={row.clientAge !== 50 ? 'primary' : 'grayscale'}
        size='small'
        variant='status'
      />
    ),
  },
  {
    key: 'vacancies',
    header: 'Availability',
    render: (row) => `${row.vacancies}/${row.capacity} Units Available`,
  },
  // {
  //   key: 'clientAttributes',
  //   header: 'Client Attributes',
  //   render: ({ clientAttributes }) => {
  //     return (
  //       <>
  //         {Object.keys(clientAttributes).map((key) => (
  //           <div key={key}>
  //             <strong>{key}:</strong>{' '}
  //             {ensureArray(clientAttributes[key]).join(', ')}
  //           </div>
  //         ))}
  //       </>
  //     );
  //   },
  // },
];

const getCustomAttributeColumns = (rows: Row[]) => {
  if (!rows || rows.length === 0) return [];

  function generateColumnDefinition(key: string) {
    return {
      key: key,
      header: key
        .replace(/^cde.custom_assessment./, '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2'),
      render: (row: Row) => {
        if (!row.clientAttributes) return null;
        return ensureArray(row.clientAttributes[key]).join(', ');
      },
      // optional: { defaultHidden: true },
    };
  }

  const columnsByKey: Record<string, ColumnDef<Row>> = {};
  rows.forEach((row) => {
    Object.keys(row.clientAttributes).forEach((key) => {
      if (columnsByKey[key]) return; // seen
      columnsByKey[key] = generateColumnDefinition(key);
    });
  });

  // sort columns by CDED Key so they always appear in the same order
  return Object.keys(columnsByKey)
    .sort()
    .map((key) => columnsByKey[key]);
};

interface Props {}
const ConsolidatedWaitlistTable: React.FC<Props> = ({}) => {
  const getColumnDefs = useCallback((rows: Row[]) => {
    const customColumns = getCustomAttributeColumns(rows);
    return COLUMNS;
    return [...COLUMNS, ...customColumns];
  }, []);

  const filters = useFilters({
    type: 'CeReferralFilterOptions',
    omit: ['workflowTemplate'],
  });

  return (
    <Stack spacing={2}>
      <CommonSearchInput
        label='Search clients'
        name='search clients'
        placeholder='Search client by name or ID'
        value={''}
        onChange={() => {}}
        fullWidth
        size='small'
        searchAdornment
      />
      <Paper>
        <GenericTableWithData<
          GetAdminConsolidatedWaitlistQuery,
          GetAdminConsolidatedWaitlistQueryVariables,
          Row
        >
          columns={COLUMNS}
          // TODO(#7387) Optional column behavior is currently undefined/unsupported
          //  when columns are provided by getColumnDefs instead of the columns prop.
          // getColumnDefs={getColumnDefs}
          queryVariables={{}}
          queryDocument={GetAdminConsolidatedWaitlistDocument}
          pagePath='consolidatedWaitlist'
          noData='No clients'
          paginationItemName='client'
          filters={filters}
          showTopToolbar
          // rowLinkTo={(row) =>
          //   generateSafePath(ProjectDashboardRoutes.REFERRAL, {
          //     projectId: row.targetProjectId,
          //     referralId: row.id,
          //   })
          // }
          // rowActionTitle='View Referral'
          // rowSecondaryActionConfigs={rowSecondaryActions}
        />
      </Paper>
    </Stack>
  );
};

export default ConsolidatedWaitlistTable;
