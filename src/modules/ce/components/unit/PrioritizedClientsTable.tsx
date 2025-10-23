import { Alert, Paper, Stack } from '@mui/material';
import React, { useMemo } from 'react';
import CommonCard from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import { configurableCeColumns } from '@/modules/ce/components/admin/AdminCeClientsTable';
import StartReferralButton from '@/modules/ce/components/unit/StartReferralButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  formatRelativeDateTime,
  parseAndFormatDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
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
  const { status } = opportunity;

  // Fetch column configuration
  const {
    data: { tableConfigLookup } = {},
    loading,
    error,
  } = useGetCeClientsUnitGroupTableConfigQuery({
    variables: { unitGroupId: unitGroupId || '' },
    skip: !unitGroupId,
  });

  // Define table columns (Default + MCI + Custom configured + Action)
  const columns: ColumnDef<CeCandidateFieldsFragment>[] = useMemo(() => {
    const canStartReferrals =
      project.access.canStartReferrals && project.access.canViewReferrals;

    const columnConfig = tableConfigLookup?.ceClientsUnitGroupConfig?.columns;
    const customColumns = (
      columnConfig ? configurableCeColumns(columnConfig) : []
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
  }, [project.access, tableConfigLookup, status, opportunity]);

  const filters = useFilters({
    type: 'CeOpportunityCandidatesFilterOptions',
  });

  // If CandidatePool has not been generated yet (due to change in eligibility or prioritization requirements), show a message
  if (!opportunity.candidatesGeneratedAt) {
    return (
      <Alert severity='info'>
        The eligible client list for this unit has not been generated yet.
        Please check back later.
      </Alert>
    );
  }
  const candidatesGeneratedAt = parseHmisDateString(
    opportunity.candidatesGeneratedAt
  );

  if (error) throw error;
  if (loading && !tableConfigLookup) return <Loading />;

  return (
    <Stack rowGap={2}>
      <CommonCard title='Eligible Clients'>
        This table lists clients who meet the eligibility requirements for this
        unit. Clients are sorted based on their priority score.
        {candidatesGeneratedAt && (
          <>
            {' '}
            The eligible client list was last updated{' '}
            {formatRelativeDateTime(candidatesGeneratedAt)} (
            {parseAndFormatDateTime(opportunity.candidatesGeneratedAt)}).
          </>
        )}
        {/* May want to add additional explainer text about this list being deduplicated (i.e. it contains destination clients) */}
      </CommonCard>
      <Paper>
        <GenericTableWithData<
          GetCeOpportunityCandidatesQuery,
          GetCeOpportunityCandidatesQueryVariables,
          CeCandidateFieldsFragment
        >
          columns={columns}
          queryVariables={{ opportunityId: opportunity.id }}
          queryDocument={GetCeOpportunityCandidatesDocument}
          pagePath='ceOpportunity.candidates'
          paginationItemName='client'
          noData={'No clients are currently eligible for this unit.'}
          filters={filters}
          defaultFilterValues={{
            excludeRecentlyDeclined: true,
          }}
        />
      </Paper>
    </Stack>
  );
};

export default PrioritizedClientsTable;
