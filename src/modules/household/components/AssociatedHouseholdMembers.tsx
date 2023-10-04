import { useMemo } from 'react';

import { RecentHouseholdMember } from '../types';

import GenericTable, {
  Props as GenericTableProps,
} from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export const householdMemberColumns: ColumnDef<
  ClientFieldsFragment | RecentHouseholdMember
>[] = [
  CLIENT_COLUMNS.linkedName,
  { ...CLIENT_COLUMNS.ssn, width: '150px' },
  { ...CLIENT_COLUMNS.dobAge, width: '180px' },
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
    <SsnDobShowContextProvider>
      <GenericTable<RecentHouseholdMember>
        rows={recentMembers || []}
        columns={columns}
        {...props}
      />
    </SsnDobShowContextProvider>
  );
};

export default AssociatedHouseholdMembers;
