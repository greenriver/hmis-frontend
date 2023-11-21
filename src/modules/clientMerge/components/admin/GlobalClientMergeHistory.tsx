import { Paper } from '@mui/material';
import { ClientMergeAuditColumns } from '../client/ClientMergeHistory';
import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GlobalClientMergeHistoryDocument,
  GlobalClientMergeHistoryQuery,
  GlobalClientMergeHistoryQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type ClientMergeAuditType = NonNullable<
  NonNullable<GlobalClientMergeHistoryQuery['mergeAuditHistory']>
>['nodes'][0];

const columns: ColumnDef<ClientMergeAuditType>[] = [
  {
    header: 'Client Name',
    render: ({ client }) =>
      client ? <ClientName client={client} linkToProfile /> : null,
  },
  ...ClientMergeAuditColumns,
];

const GlobalClientMergeHistory = () => {
  const pathToMerge = generateSafePath(
    AdminDashboardRoutes.PERFORM_CLIENT_MERGES
  );

  return (
    <>
      <PageTitle
        title='Client Merge History'
        actions={
          <ButtonLink to={pathToMerge}>Review Potential Duplicates</ButtonLink>
        }
      />
      <Paper>
        <GenericTableWithData<
          GlobalClientMergeHistoryQuery,
          GlobalClientMergeHistoryQueryVariables,
          ClientMergeAuditType
        >
          queryVariables={{}}
          queryDocument={GlobalClientMergeHistoryDocument}
          columns={columns}
          pagePath='mergeAuditHistory'
          noData='No merge history'
        />
      </Paper>
    </>
  );
};
export default GlobalClientMergeHistory;
