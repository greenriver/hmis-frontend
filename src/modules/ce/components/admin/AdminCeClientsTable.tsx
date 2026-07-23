import { Alert, Paper, Stack } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import useDebouncedState from '@/hooks/useDebouncedState';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import useTableFilters from '@/hooks/useTableFilters';
import useTablePagination from '@/hooks/useTablePagination';

import EligibleUnitGroupsDialog from '@/modules/ce/components/admin/EligibleUnitGroupsDialog';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  CeClientFieldsFragment,
  ExternalIdentifierType,
  GetCeClientsDocument,
  GetCeClientsQuery,
  GetCeClientsQueryVariables,
  TableColumnConfigFieldsFragment,
  TableColumnConfigType,
  useGetCeCandidatePoolSummaryQuery,
  useGetCeClientsTableConfigQuery,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: DataColumnDef<
  CeClientFieldsFragment,
  GetCeClientsQueryVariables
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

interface Props {
  projectGroupId?: string;
}

const AdminCeClientsTable: React.FC<Props> = ({ projectGroupId }) => {
  // Feature flags to check whether to show MCI ID column
  const { globalFeatureFlags: { mciIdEnabled } = {} } = useGlobalFeatureFlags();

  // Fetch summary in order to display warning if pools may be out-of-date
  const { data: poolSummaryData } = useGetCeCandidatePoolSummaryQuery({
    variables: { projectGroupId: projectGroupId || null },
  });
  const neverFullyGeneratedCount =
    poolSummaryData?.ceCandidatePoolSummary?.neverFullyGeneratedCount ?? 0;

  // Fetch column configuration
  const {
    data: { tableConfigLookup } = {},
    loading,
    error,
  } = useGetCeClientsTableConfigQuery({
    variables: { projectGroupId: projectGroupId || null },
  });

  // Internal state for search and dialog
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const [selectedRow, setSelectedRow] =
    React.useState<CeClientFieldsFragment | null>(null);

  const tableColumnConfig = useMemo(
    () => tableConfigLookup?.ceClientsConfig?.columns,
    [tableConfigLookup]
  );

  // Keys to resolve for client attributes (based on column configuration)
  const clientAttributeKeys = useMemo(
    () => (tableColumnConfig || []).map((c) => c.key),
    [tableColumnConfig]
  );

  // Define table columns (Default + MCI + Custom configured)
  const columnsWithCustom = useMemo(() => {
    const customColumns = tableColumnConfig
      ? configurableCeColumns(tableColumnConfig)
      : [];
    return [
      ...COLUMNS,
      ...(mciIdEnabled
        ? [externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID')]
        : []),
      ...(customColumns || []),
    ];
  }, [tableColumnConfig, mciIdEnabled]);

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'CeClientFilterOptions',
    dynamicFilters: tableConfigLookup?.ceClientsConfig?.filters,
    omit: ['projectGroupId'], // only exposed via Workspaces
  });
  const pagination = useTablePagination();

  const rowSecondaryActionConfigs = useCallback(
    (row: CeClientFieldsFragment) => {
      if (
        !row.viewableSourceClientIds ||
        row.viewableSourceClientIds.length === 0
      )
        return [];
      return [
        {
          title: 'View Client',
          key: 'viewClient',
          ariaLabel: `View Client, ${row.clientName}`,
          to: generateSafePath(ClientDashboardRoutes.PROFILE, {
            clientId: row.viewableSourceClientIds[0],
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
      {neverFullyGeneratedCount > 0 && (
        <Alert severity='info'>
          Eligible clients are still being calculated for some projects. Client
          list may be incomplete.
        </Alert>
      )}
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
          GetCeClientsQuery,
          GetCeClientsQueryVariables,
          CeClientFieldsFragment
        >
          columns={columnsWithCustom}
          queryVariables={{
            filters: {
              searchTerm: debouncedSearch || undefined,
              projectGroupId,
            },
            clientAttributeKeys,
          }}
          queryDocument={GetCeClientsDocument}
          pagePath='ceClients'
          noData='No clients'
          paginationItemName='client'
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          pagination={pagination}
          handleRowClick={(row) => setSelectedRow(row)}
          rowActionTitle='View Eligible Projects'
          rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        />
      </Paper>
      {selectedRow && (
        <EligibleUnitGroupsDialog
          ceClientId={selectedRow.id}
          onClose={() => setSelectedRow(null)}
          clientName={selectedRow.clientName}
          open
        />
      )}
    </Stack>
  );
};

export default AdminCeClientsTable;
