import { Paper, Stack } from '@mui/material';
import GenericTableWithData from '../../dataFetching/components/GenericTableWithData';
import { lastUpdatedBy } from '../../hmis/hmisUtil';
import {
  DeactivateScanCardButton,
  GenerateScanCardButton,
  RestoreScanCardButton,
} from './ScanCardButtons';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
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
    render: (row) => row.code,
  },
  {
    key: 'history',
    header: 'History',
    render: (row) => (
      <Stack>
        <span>Created on {lastUpdatedBy(row.dateCreated, row.createdBy)}</span>
        {row.dateDeleted && (
          <span>
            Deleted on {lastUpdatedBy(row.dateDeleted, row.deletedBy)}
          </span>
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
  const { clientId } = useSafeParams() as { clientId: string };

  return (
    <>
      <PageTitle
        title='Scan Cards'
        actions={<GenerateScanCardButton clientId={clientId} />}
      />
      <Paper>
        <GenericTableWithData<
          GetClientScanCardCodesQuery,
          GetClientScanCardCodesQueryVariables,
          Row
        >
          queryVariables={{ id: clientId }}
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
