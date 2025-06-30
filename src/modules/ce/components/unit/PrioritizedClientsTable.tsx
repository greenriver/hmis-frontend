import React, { useMemo } from 'react';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import StartReferralButton from '@/modules/ce/components/unit/StartReferralButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
  CeOpportunityStatus,
  GetCeOpportunityCandidatesDocument,
  GetCeOpportunityCandidatesQuery,
  GetCeOpportunityCandidatesQueryVariables,
} from '@/types/gqlTypes';

const COLUMNS: ColumnDef<CeCandidateFieldsFragment>[] = [
  {
    header: 'Client',
    key: 'client',
    sticky: 'left',
    render: (candidate) => candidate.clientName,
  },
  {
    header: 'Priority Score',
    render: 'priorityScore',
    key: 'priorityScore',
  },
];

interface Props {
  opportunity: CeOpportunityFieldsFragment;
}
const PrioritizedClientsTable: React.FC<Props> = ({ opportunity }) => {
  const { project } = useProjectDashboardContext();
  const { status } = opportunity;

  const columns = useMemo(() => {
    return [
      ...COLUMNS,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (row: CeCandidateFieldsFragment) => (
          <TableRowActions
            record={row}
            recordName={`ID ${row.id}`}
            primaryAction={
              status === CeOpportunityStatus.Open &&
              project.access.canStartReferrals && (
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
  }, [project.access.canStartReferrals, opportunity, status]);

  return (
    <GenericTableWithData<
      GetCeOpportunityCandidatesQuery,
      GetCeOpportunityCandidatesQueryVariables,
      CeCandidateFieldsFragment
    >
      columns={columns}
      queryVariables={{ opportunityId: opportunity.id }}
      queryDocument={GetCeOpportunityCandidatesDocument}
      pagePath='ceOpportunity.candidates'
      paginationItemName='candidates'
    />
  );
};

export default PrioritizedClientsTable;
