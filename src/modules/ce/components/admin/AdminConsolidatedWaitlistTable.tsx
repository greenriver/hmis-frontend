import { Chip, Paper, Stack } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  GetAdminConsolidatedWaitlistDocument,
  GetAdminConsolidatedWaitlistQuery,
  GetAdminConsolidatedWaitlistQueryVariables,
  useGetConsolidatedWaitlistColumnsQuery,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

type Row = NonNullable<
  GetAdminConsolidatedWaitlistQuery['ceConsolidatedWaitlist']['candidates']
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
    header: 'Added to Waitlist',
    render: ({ whenAddedToCandidatePool }) =>
      whenAddedToCandidatePool
        ? parseAndFormatDateTime(whenAddedToCandidatePool)
        : '',
    optional: { defaultHidden: false },
  },
  {
    key: 'whenUpdatedInCandidatePool',
    header: 'Updated in Waitlist',
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
    optional: { defaultHidden: false },
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip
        label={
          row.vacancies > 0
            ? 'Eligible - Vacancies Available'
            : 'Eligible - No Vacancies'
        }
        color={row.vacancies > 0 ? 'primary' : 'grayscale'}
        size='small'
        variant='status'
      />
    ),
  },
  {
    key: 'vacancies',
    header: 'Availability',
    render: (row) => `${row.vacancies}/${row.capacity} Units Available`,
    optional: { defaultHidden: false },
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

function clientAttributeDisplay(
  row: Row,
  clientAttributeKey: string
): string | null {
  if (!row.clientAttributes) return null;
  return ensureArray(row.clientAttributes[clientAttributeKey]).join(', ');
}

interface Props {}
const ConsolidatedWaitlistTable: React.FC<Props> = ({}) => {
  const { data, loading, error } = useGetConsolidatedWaitlistColumnsQuery();

  const columnsWithCustom = useMemo(() => {
    if (!data || !data.ceConsolidatedWaitlist?.clientAttributeColumns)
      return COLUMNS;
    const customColumns =
      data.ceConsolidatedWaitlist.clientAttributeColumns.map(
        ({ key, value }) => ({
          key: key,
          header: value,
          render: (row: Row) => clientAttributeDisplay(row, key),
        })
      );
    return [...COLUMNS, ...customColumns];
  }, [data]);

  const filters = useFilters({
    type: 'CeReferralFilterOptions',
    omit: ['workflowTemplate'],
  });

  if (error) throw error;
  if (loading && !data) return <Loading />;

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
          columns={columnsWithCustom}
          queryVariables={{}}
          queryDocument={GetAdminConsolidatedWaitlistDocument}
          pagePath='ceConsolidatedWaitlist.candidates'
          noData='No clients'
          paginationItemName='record'
          filters={filters}
          rowLinkTo={(row) =>
            row.sourceClientIds.length > 0
              ? generateSafePath(ClientDashboardRoutes.PROFILE, {
                  clientId: row.sourceClientIds[0],
                })
              : undefined
          }
          rowActionTitle='View Client'
          // rowSecondaryActionConfigs={rowSecondaryActions}
          // secondary action should probably link to the _unit group waitlist which isnt a thing yet
        />
      </Paper>
    </Stack>
  );
};

export default ConsolidatedWaitlistTable;
