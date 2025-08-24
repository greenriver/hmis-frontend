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
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  CeClientFieldsFragment,
  ExternalIdentifierType,
  GetAdminConsolidatedWaitlistDocument,
  GetAdminConsolidatedWaitlistQuery,
  GetAdminConsolidatedWaitlistQueryVariables,
  TableColumnConfigFieldsFragment,
  TableColumnConfigType,
  useGetConsolidatedWaitlistColumnsQuery,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: DataColumnDef<
  CeClientFieldsFragment,
  GetAdminConsolidatedWaitlistQueryVariables
>[] = [
  {
    key: 'clientName',
    header: 'Client Name',
    render: 'clientName',
  },
];

export const configurableCeColumns = (
  columns: TableColumnConfigFieldsFragment[]
) => {
  return columns.map(({ key, label, type }) => ({
    key: key,
    header: label,
    render: (row: CeClientFieldsFragment | CeCandidateFieldsFragment) => {
      if (!row.clientAttributes) return null;
      const value = row.clientAttributes[key];
      if (!value) return null;
      let values = ensureArray(value);
      if (type === TableColumnConfigType.Date) {
        values = values.map(parseAndFormatDate);
      }
      return values.join(', ');
    },
  }));
};

interface Props {}
const ConsolidatedWaitlistTable: React.FC<Props> = ({}) => {
  // Feature flags to check whether to show MCI ID column
  const { globalFeatureFlags: { mciIdEnabled } = {} } = useGlobalFeatureFlags();
  // Fetch column configuration for consolidated waitlist
  const {
    data: { tableConfigLookup } = {},
    loading,
    error,
  } = useGetConsolidatedWaitlistColumnsQuery();

  // Internal state for search and dialog
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const [selectedRow, setSelectedRow] =
    React.useState<CeClientFieldsFragment | null>(null);

  // Define table columns (Default + MCI + Custom configured)
  const columnsWithCustom = useMemo(() => {
    const columnConfig = tableConfigLookup?.consolidatedWaitlist?.columns;
    const customColumns = columnConfig
      ? configurableCeColumns(columnConfig)
      : [];
    return [
      ...COLUMNS,
      ...(mciIdEnabled
        ? [externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID')]
        : []),
      ...(customColumns || []),
    ];
  }, [tableConfigLookup, mciIdEnabled]);

  const filters = useFilters({
    type: 'CeClientFilterOptions',
    omit: ['searchTerm'],
    dynamicFilters: tableConfigLookup?.consolidatedWaitlist?.filters,
  });

  const rowSecondaryActionConfigs = useCallback(
    (row: CeClientFieldsFragment) => {
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
    },
    []
  );

  if (error) throw error;
  if (loading && !tableConfigLookup) return <Loading />;

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
          CeClientFieldsFragment
        >
          columns={columnsWithCustom}
          queryVariables={{
            filters: { searchTerm: debouncedSearch || undefined },
          }}
          queryDocument={GetAdminConsolidatedWaitlistDocument}
          pagePath='ceClients'
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
          clientName={selectedRow.clientName}
          open
        />
      )}
    </Stack>
  );
};

export default ConsolidatedWaitlistTable;
