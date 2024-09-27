import { Paper } from '@mui/material';
import { ClientDashboardRoutes } from '@/app/routes';
import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
import {
  ClientMergeHistoryDocument,
  ClientMergeHistoryQuery,
  ClientMergeHistoryQueryVariables,
  MergeAuditEventFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const ClientMergeAuditColumns: ColumnDef<MergeAuditEventFieldsFragment>[] =
  [
    {
      header: 'Merged Client IDs',
      render: ({ clientIdsMerged }) => clientIdsMerged.join(', '),
    },
    {
      header: 'Merged By',
      render: ({ user }) => user?.name || 'Unknown',
    },
    {
      header: 'Merged At',
      render: ({ mergedAt }) => (
        <RelativeDateTableCellContents dateTimeString={mergedAt} horizontal />
      ),
    },
    // TODO: click-to-show pre merge state?
    // {
    //   header: 'Details',
    //   render: ({ preMergeState }) => JSON.stringify(preMergeState),
    // },
  ];

const ClientMergeHistory = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const pathToMerge = generateSafePath(ClientDashboardRoutes.NEW_MERGE, {
    clientId,
  });

  return (
    <>
      <PageTitle
        title='Client Merge History'
        actions={<ButtonLink to={pathToMerge}>New Merge</ButtonLink>}
      />
      <Paper>
        <GenericTableWithData<
          ClientMergeHistoryQuery,
          ClientMergeHistoryQueryVariables,
          MergeAuditEventFieldsFragment
        >
          queryVariables={{ clientId }}
          queryDocument={ClientMergeHistoryDocument}
          columns={ClientMergeAuditColumns}
          pagePath='client.mergeAuditHistory'
          noData='No merge history'
        />
      </Paper>
    </>
  );
};
export default ClientMergeHistory;
