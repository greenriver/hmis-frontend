import { Stack } from '@mui/material';
import { useMemo } from 'react';

import ClientName from '@/components/elements/ClientName';
import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import { last4SSN, dob, age } from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export const householdMemberColumns: ColumnDef<ClientFieldsFragment>[] = [
  {
    header: 'Name',
    width: '15%',
    key: 'name',
    render: (client) => (
      <ClientName
        client={client}
        routerLinkProps={{ target: '_blank' }}
        linkToProfile
      />
    ),
  },
  {
    header: 'SSN',
    key: 'ssn',
    width: '1%',
    render: (client) => last4SSN(client),
  },
  {
    header: 'DOB / Age',
    width: '1%',
    key: 'dob',
    render: (client) =>
      client.dob && (
        <Stack direction='row' spacing={1}>
          <span>{dob(client)}</span>
          <span>{`(${age(client)})`}</span>
        </Stack>
      ),
  },
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
