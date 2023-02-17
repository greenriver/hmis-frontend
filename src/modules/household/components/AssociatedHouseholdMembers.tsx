import { useMemo } from 'react';

import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export const householdMemberColumns: ColumnDef<ClientFieldsFragment>[] = [
  {
    header: 'Name',
    width: '20%',
    key: 'name',
    render: (client) => (
      <ClientName
        client={client}
        routerLinkProps={{ target: '_blank' }}
        linkToProfile
      />
    ),
  },
  { ...CLIENT_COLUMNS.ssn, width: '15%' },
  { ...CLIENT_COLUMNS.dobAge, width: '15%' },
];

interface Props
  extends Omit<GenericTableProps<ClientFieldsFragment>, 'rows' | 'columns'> {
  recentMembers: ClientFieldsFragment[];
  additionalColumns?: ColumnDef<ClientFieldsFragment>[];
  hideHeaders?: boolean;
}
const AssociatedHouseholdMembers = ({
  recentMembers,
  additionalColumns,
  hideHeaders,
  ...props
}: Props) => {
  const columns: ColumnDef<ClientFieldsFragment>[] = useMemo(() => {
    return [
      ...householdMemberColumns.map((c) =>
        hideHeaders ? { ...c, header: '' } : c
      ),
      ...(additionalColumns || []),
    ];
  }, [hideHeaders, additionalColumns]);

  if (recentMembers.length === 0) return null;
  return (
    <GenericTable<ClientFieldsFragment>
      rows={recentMembers || []}
      columns={columns}
      {...props}
    />
  );
};

export default AssociatedHouseholdMembers;
