import { Alert, Paper, Stack } from '@mui/material';
import React, { useMemo } from 'react';
import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import useTableFilters from '@/hooks/useTableFilters';
import { configurableCeColumns } from '@/modules/ce/components/admin/AdminCeClientsTable';
import StartReferralButton from '@/modules/ce/components/unit/StartReferralButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  formatRelativeDateTime,
  parseAndFormatDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
  CeOpportunityStatus,
  GetCeOpportunityCandidatesDocument,
  GetCeOpportunityCandidatesQuery,
  GetCeOpportunityCandidatesQueryVariables,
  useGetCeClientsUnitGroupTableConfigQuery,
} from '@/types/gqlTypes';

const COLUMNS: ColumnDef<CeCandidateFieldsFragment>[] = [
  {
    header: 'Client',
    key: 'client',
    sticky: 'left',
    render: (candidate) => candidate.clientName,
  },
];

const defaultPriorityColumn: ColumnDef<CeCandidateFieldsFragment> = {
  header: 'Priority Score',
  render: ({ priorityScores }) => priorityScores.join(', '),
  key: 'priorityScore',
};

interface Props {
  opportunity: CeOpportunityFieldsFragment;
  unitGroupId?: string;
}
const PrioritizedClientsTable: React.FC<Props> = ({
  opportunity,
  unitGroupId,
}) => {
  const { project } = useProjectDashboardContext();
  const { status, candidatesGeneratedAt, candidatesFullyGeneratedAt } =
    opportunity;

  // Fetch column configuration
  const {
    data: { tableConfigLookup } = {},
    loading,
    error,
  } = useGetCeClientsUnitGroupTableConfigQuery({
    variables: { unitGroupId: unitGroupId || '' },
    skip: !unitGroupId,
  });

  const tableColumnConfig = useMemo(
    () => tableConfigLookup?.ceClientsUnitGroupConfig?.columns,
    [tableConfigLookup]
  );

  // Keys to resolve for client attributes (based on column configuration)
  const clientAttributeKeys = useMemo(
    () => (tableColumnConfig || []).map((c) => c.key),
    [tableColumnConfig]
  );

  // Define table columns (Default + MCI + Custom configured + Action)
  const columns: ColumnDef<CeCandidateFieldsFragment>[] = useMemo(() => {
    const canStartReferrals =
      project.access.canStartReferrals && project.access.canViewReferrals;

    const customColumns = (
      tableColumnConfig ? configurableCeColumns(tableColumnConfig) : []
    ) as ColumnDef<CeCandidateFieldsFragment>[];

    return [
      ...COLUMNS,
      ...(customColumns || [defaultPriorityColumn]),
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (row: CeCandidateFieldsFragment) => (
          <TableRowActions
            record={row}
            recordName={`ID ${row.id}`}
            primaryAction={
              status === CeOpportunityStatus.Open &&
              canStartReferrals && (
                <StartReferralButton
                  opportunity={opportunity}
                  candidate={row}
                />
              )
            }
          />
        ),
      },
    ];
  }, [project.access, tableColumnConfig, status, opportunity]);

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'CeOpportunityCandidatesFilterOptions',
    omit: ['searchTerm'],
    initialFilterValues: { excludeDeclinedClients: true },
  });

  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  if (!candidatesFullyGeneratedAt) {
    return (
      <Alert severity='info'>
        The eligible client list is still being set up, either because it is
        new, or because rules recently changed. Please check back later.
      </Alert>
    );
  }

  const candidatesGeneratedAtDate = parseHmisDateString(candidatesGeneratedAt);

  if (error) throw error;
  if (loading && !tableConfigLookup) return <Loading />;

  return (
    <Stack rowGap={2}>
      <CommonCard title='Eligible Clients'>
        This table lists clients who meet the eligibility requirements for this
        unit. Clients are sorted based on their priority score.
        {candidatesGeneratedAtDate && (
          <>
            {' '}
            The eligible client list was last updated{' '}
            {formatRelativeDateTime(candidatesGeneratedAtDate)} (
            {parseAndFormatDateTime(candidatesGeneratedAt || '')}).
          </>
        )}
        {/* May want to add additional explainer text about this list being deduplicated (i.e. it contains destination clients) */}
      </CommonCard>
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
          GetCeOpportunityCandidatesQuery,
          GetCeOpportunityCandidatesQueryVariables,
          CeCandidateFieldsFragment
        >
          columns={columns}
          queryVariables={{
            opportunityId: opportunity.id,
            filters: { searchTerm: debouncedSearch || undefined },
            clientAttributeKeys,
          }}
          queryDocument={GetCeOpportunityCandidatesDocument}
          pagePath='ceOpportunity.candidates'
          paginationItemName='client'
          noData={'No clients are currently eligible for this unit.'}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
        />
      </Paper>
    </Stack>
  );
};

export default PrioritizedClientsTable;
