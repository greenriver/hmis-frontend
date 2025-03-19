import React, { useMemo } from 'react';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import BeginReferralButton from '@/modules/ce/components/BeginReferralButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
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
    render: (candidate) => clientBriefName(candidate.client),
  },
  {
    header: 'Priority Score',
    render: 'priorityScore',
    key: 'priorityScore',
  },
];

interface Props {
  opportunityId: string;
}
const PrioritizedClientsTable: React.FC<Props> = ({ opportunityId }) => {
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
              <BeginReferralButton
                opportunityId={opportunityId}
                candidate={row}
              />
            }
            menuActionConfigs={[
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
            ]}
          />
        ),
      },
    ];
  }, [opportunityId]);

  return (
    <GenericTableWithData<
      GetCeOpportunityCandidatesQuery,
      GetCeOpportunityCandidatesQueryVariables,
      CeCandidateFieldsFragment
    >
      columns={columns}
      queryVariables={{ opportunityId: opportunityId }}
      queryDocument={GetCeOpportunityCandidatesDocument}
      pagePath='ceOpportunity.candidates'
      paginationItemName='candidates'
      //showTopToolbar={true}
    />
  );
};

export default PrioritizedClientsTable;
