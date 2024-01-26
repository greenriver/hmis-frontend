import { Paper, Stack } from '@mui/material';
import GenericTableWithData from '../../dataFetching/components/GenericTableWithData';
import GenerateScanCardButton from './GenerateScanCardButton';
import {
  DeactivateScanCardButton,
  RestoreScanCardButton,
} from './ManageCardButtons';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import RelativeDateDisplay from '@/modules/hmis/components/RelativeDateDisplay';
import {
  GetClientScanCardCodesDocument,
  GetClientScanCardCodesQuery,
  GetClientScanCardCodesQueryVariables,
} from '@/types/gqlTypes';

type Row = NonNullable<
  GetClientScanCardCodesQuery['client']
>['scanCardCodes']['nodes'][0];

const columns: ColumnDef<Row>[] = [
  {
    key: 'code',
    header: 'Scan Card ID',
    render: (row) => row.value,
  },
  {
    key: 'history',
    header: 'History',
    render: (row) => (
      <Stack sx={{ width: 'fit-content' }}>
        <RelativeDateDisplay
          dateString={row.dateCreated}
          prefixVerb='Created'
          suffixText={row.createdBy?.name ? `by ${row.createdBy.name}` : ''}
          TooltipProps={{ placement: 'right-end' }}
        />
        {row.dateDeleted && (
          <RelativeDateDisplay
            dateString={row.dateDeleted}
            prefixVerb='Deactivated'
            suffixText={row.deletedBy?.name ? `by ${row.deletedBy.name}` : ''}
            TooltipProps={{ placement: 'right-end' }}
          />
        )}
      </Stack>
    ),
  },
  {
    key: 'actions',
    header: '',
    textAlign: 'right',
    render: (row) =>
      row.dateDeleted ? (
        <RestoreScanCardButton id={row.id} />
      ) : (
        <DeactivateScanCardButton id={row.id} />
      ),
  },
];

const ClientScanCards = () => {
  const { client } = useClientDashboardContext();

  return (
    <>
      <PageTitle
        title='Scan Cards'
        actions={<GenerateScanCardButton client={client} />}
      />
      <Paper>
        <GenericTableWithData<
          GetClientScanCardCodesQuery,
          GetClientScanCardCodesQueryVariables,
          Row
        >
          queryVariables={{ id: client.id }}
          queryDocument={GetClientScanCardCodesDocument}
          columns={columns}
          pagePath='client.scanCardCodes'
          noData='No scan cards'
          headerCellSx={() => ({ color: 'text.secondary' })}
          recordType='ScanCardCode'
          paginationItemName='scan card'
          showFilters
          noFilter
        />
      </Paper>
    </>
  );
};
export default ClientScanCards;
