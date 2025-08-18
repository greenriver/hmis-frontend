import { Paper, Stack } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import useDebouncedState from '@/hooks/useDebouncedState';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import ConsolidatedWaitlistDialog from '@/modules/ce/components/admin/ConsolidatedWaitlistDialog';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { useFilters } from '@/modules/hmis/filterUtil';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  CeClientFieldsFragment,
  ExternalIdentifierType,
  GetAdminConsolidatedWaitlistDocument,
  GetAdminConsolidatedWaitlistQuery,
  GetAdminConsolidatedWaitlistQueryVariables,
  useGetConsolidatedWaitlistColumnsQuery,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

type Row = CeClientFieldsFragment;

const COLUMNS: DataColumnDef<
  Row,
  GetAdminConsolidatedWaitlistQueryVariables
>[] = [
  {
    key: 'clientName',
    header: 'Client Name',
    render: 'clientName',
  },
];

function clientAttributeDisplay(
  row: Row,
  clientAttributeKey: string
): string | null {
  if (!row.aggregatedClientAttributes) return null;
  return ensureArray(row.aggregatedClientAttributes[clientAttributeKey]).join(
    ', '
  );
}

interface Props {}
const ConsolidatedWaitlistTable: React.FC<Props> = ({}) => {
  // Feature flags to check whether to show MCI ID column
  const { globalFeatureFlags: { mciIdEnabled } = {} } = useGlobalFeatureFlags();
  // Fetch column configuration for consolidated waitlist
  const {
    data: { ceConsolidatedWaitlist } = {},
    loading,
    error,
  } = useGetConsolidatedWaitlistColumnsQuery();

  // Internal state for search and dialog
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const [selectedRow, setSelectedRow] = React.useState<Row | null>(null);

  // Define table columns (Default + MCI + Custom configured)
  const columnsWithCustom = useMemo(() => {
    const customColumns = ceConsolidatedWaitlist?.clientAttributeColumns.map(
      ({ key, value }) => ({
        key: key,
        header: value,
        render: (row: Row) => clientAttributeDisplay(row, key),
      })
    );
    return [
      ...COLUMNS,
      ...(mciIdEnabled
        ? [externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID')]
        : []),
      ...(customColumns || []),
    ];
  }, [ceConsolidatedWaitlist, mciIdEnabled]);

  const filters = useFilters({
    type: 'CeClientFilterOptions',
    omit: ['searchTerm'],
    dynamicFilters: ceConsolidatedWaitlist?.availableFilters,
  });

  const rowSecondaryActionConfigs = useCallback((row: Row) => {
    if (!row.sourceClientIds || row.sourceClientIds.length === 0) return [];
    return [
      {
        title: 'View Client',
        key: 'viewClient',
        ariaLabel: `View Client, ${row.clientName}`,
        to: generateSafePath(ClientDashboardRoutes.PROFILE, {
          clientId: row.sourceClientIds[0],
        }),
      },
    ];
  }, []);

  if (error) throw error;
  if (loading && !ceConsolidatedWaitlist) return <Loading />;

  return (
    <Stack spacing={2}>
      <CommonSearchInput
        label='Search clients'
        name='search clients'
        placeholder='Search client by name or ID'
        value={search}
        onChange={setSearch}
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
          queryVariables={{
            filters: { searchTerm: debouncedSearch || undefined },
          }}
          queryDocument={GetAdminConsolidatedWaitlistDocument}
          pagePath='ceConsolidatedWaitlist.ceClients'
          noData='No clients'
          paginationItemName='client'
          filters={filters}
          handleRowClick={(row) => setSelectedRow(row)}
          rowActionTitle='View Eligible Projects'
          rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        />
      </Paper>
      {selectedRow && (
        <ConsolidatedWaitlistDialog
          id={selectedRow.id}
          onClose={() => setSelectedRow(null)}
          open
        />
      )}
    </Stack>
  );
};

export default ConsolidatedWaitlistTable;
