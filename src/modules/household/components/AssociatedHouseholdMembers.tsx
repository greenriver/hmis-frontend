import { useMemo } from 'react';

import { getClientIdentification, RecentHouseholdMember } from '../types';

import GenericTable, {
  Props as GenericTableProps,
} from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export const householdMemberColumns: ColumnDef<
  ClientFieldsFragment | RecentHouseholdMember
>[] = [
  {
    header: 'Name',
    width: '20%',
    key: 'name',
    render: (client) => (
      <ClientName
        client={getClientIdentification(client)}
        routerLinkProps={{ target: '_blank' }}
        linkToProfile
      />
    ),
  },
  {
    header: 'SSN',
    key: 'ssn',
    width: '15%',
    render: (client) => (
      <ClientSsn client={getClientIdentification(client)} lastFour />
    ),
  },
  {
    header: 'DOB / Age',
    width: '10%',
    key: 'dob',
    render: (client) => (
      <ClientDobAge client={getClientIdentification(client)} alwaysShow />
    ),
  },
];

interface Props
  extends Omit<GenericTableProps<RecentHouseholdMember>, 'rows' | 'columns'> {
  recentMembers: RecentHouseholdMember[];
  additionalColumns?: ColumnDef<RecentHouseholdMember>[];
  hideHeaders?: boolean;
}
const AssociatedHouseholdMembers = ({
  recentMembers,
  additionalColumns,
  hideHeaders,
  ...props
}: Props) => {
  const columns: ColumnDef<RecentHouseholdMember>[] = useMemo(() => {
    return [
      ...householdMemberColumns.map((c) =>
        hideHeaders ? { ...c, header: '' } : c
      ),
      ...(additionalColumns || []),
    ];
  }, [hideHeaders, additionalColumns]);

  if (recentMembers.length === 0) return null;
  return (
    <GenericTable<RecentHouseholdMember>
      rows={recentMembers || []}
      columns={columns}
      {...props}
    />
  );
};

export default AssociatedHouseholdMembers;
