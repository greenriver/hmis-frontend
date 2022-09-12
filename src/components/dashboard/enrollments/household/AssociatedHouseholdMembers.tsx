import { Stack } from '@mui/material';
import { useMemo } from 'react';

import GenericTable, {
  ColumnDef,
  Props as GenericTableProps,
} from '@/components/elements/GenericTable';
import { age, clientName, dob, maskedSSN } from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

const defaultColumns: ColumnDef<ClientFieldsFragment>[] = [
  {
    header: 'Name',
    key: 'name',
    render: (client) => clientName(client),
  },
  {
    header: 'Last 4 Social',
    key: 'ssn',
    render: (client) => maskedSSN(client),
  },
  {
    header: 'DOB / Age',
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
      ...defaultColumns.map((c) => (hideHeaders ? { ...c, header: '' } : c)),
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
