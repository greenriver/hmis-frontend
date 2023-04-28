import { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ClientsTable = ({ projectId }: { projectId: string }) => {
  const columns: ColumnDef<ClientFieldsFragment>[] = [CLIENT_COLUMNS.name];

  const rowLinkTo = useCallback(
    (client: ClientFieldsFragment) =>
      generateSafePath(ClientDashboardRoutes.PROFILE, {
        clientId: client.id,
      }),
    []
  );

  return (
    <GenericTableWithData<
      SearchClientsQuery,
      SearchClientsQueryVariables,
      ClientFieldsFragment
    >
      queryVariables={{ input: { projects: [projectId] } }}
      queryDocument={SearchClientsDocument}
      columns={columns}
      rowLinkTo={rowLinkTo}
      noData='No clients.'
      pagePath='clientSearch'
    />
  );
};
export default ClientsTable;
