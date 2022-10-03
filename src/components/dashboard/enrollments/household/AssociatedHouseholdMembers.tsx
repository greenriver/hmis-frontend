import { Stack } from '@mui/material';
import { useMemo } from 'react';

import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import LinkToClient from '@/components/elements/LinkToClient';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export const householdMemberColumns: ColumnDef<ClientFieldsFragment>[] = [
  {
    header: 'Name',
    width: '15%',
    key: 'name',
    render: (client) => <LinkToClient client={client} target='_blank' />,
  },
  {
    header: 'SSN',
    key: 'ssn',
    width: '1%',
    render: (client) => HmisUtil.last4SSN(client),
  },
  {
    header: 'DOB / Age',
    width: '1%',
    key: 'dob',
    render: (client) =>
      client.dob && (
        <Stack direction='row' spacing={1}>
          <span>{HmisUtil.dob(client)}</span>
          <span>{`(${HmisUtil.age(client)})`}</span>
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
