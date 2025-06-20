import React, { useMemo } from 'react';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import BeginReferralButton from '@/modules/ce/components/unit/BeginReferralButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  clientBriefName,
  clientNameFromRecordWithOptionalClient,
} from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
  CeOpportunityStatus,
  GetCeOpportunityCandidatesDocument,
  GetCeOpportunityCandidatesQuery,
  GetCeOpportunityCandidatesQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<CeCandidateFieldsFragment>[] = [
  {
    header: 'Client',
    key: 'client',
    sticky: 'left',
    render: (candidate) => clientNameFromRecordWithOptionalClient(candidate),
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
                <BeginReferralButton
                  opportunity={opportunity}
                  candidate={row}
                />
              )
            }
            menuActionConfigs={
              row.client
                ? [
                    {
                      title: 'View Client',
                      openInNew: true,
                      key: 'client',
                      ariaLabel: `View Client, ${clientBriefName(row.client)}`,
                      to: generateSafePath(ClientDashboardRoutes.PROFILE, {
                        clientId: row.client.id,
                      }),
                    },
                    // TODO(#7321) - add menu item for sending project here?
                  ]
                : []
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
