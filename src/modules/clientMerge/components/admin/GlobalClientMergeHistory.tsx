import { Paper } from '@mui/material';
import { ClientMergeAuditColumns } from '../client/ClientMergeHistory';
import ButtonLink from '@/components/elements/ButtonLink';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useTableFilters from '@/hooks/useTableFilters';
import ClientName from '@/modules/client/components/ClientName';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GlobalClientMergeHistoryDocument,
  GlobalClientMergeHistoryQuery,
  GlobalClientMergeHistoryQueryVariables,
  MergeAuditEventFilterOptions,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type ClientMergeAuditType = NonNullable<
  NonNullable<GlobalClientMergeHistoryQuery['mergeAuditHistory']>
>['nodes'][0];

const columns: ColumnDef<ClientMergeAuditType>[] = [
  {
    header: 'Client Name',
    key: 'clientName',
    render: ({ client }) => (client ? <ClientName client={client} /> : null),
  },
  ...ClientMergeAuditColumns,
];

const GlobalClientMergeHistory = () => {
  const pathToMerge = generateSafePath(
    AdminDashboardRoutes.PERFORM_CLIENT_MERGES
  );
  const { filters, filterValues, setFilterValues } =
    useTableFilters<MergeAuditEventFilterOptions>({
      type: 'MergeAuditEventFilterOptions',
    });

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
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          recordType='MergeAuditEvent'
          paginationItemName='merge event'
          noSort
          rowSecondaryActionConfigs={(row) =>
            row.client ? [getViewClientMenuItem(row.client)] : []
          }
        />
      </Paper>
    </>
  );
};
export default GlobalClientMergeHistory;
