import { useMemo } from 'react';

import { RecentHouseholdMember } from '../types';

import RelativeDate from '@/components/elements/RelativeDate';
import GenericTable, {
  Props as GenericTableProps,
} from '@/components/elements/table/GenericTable';
import {
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  ClientFieldsFragment,
  ClientSearchResultFieldsFragment,
} from '@/types/gqlTypes';

export const householdMemberColumns: ColumnDef<
  | ClientFieldsFragment
  | ClientSearchResultFieldsFragment
  | RecentHouseholdMember
>[] = [
  CLIENT_COLUMNS.name,
  { ...CLIENT_COLUMNS.ssn, width: '150px' },
  { ...CLIENT_COLUMNS.dobAge, width: '180px' },
];

interface Props
  extends Omit<GenericTableProps<RecentHouseholdMember>, 'rows' | 'columns'> {
  recentMembers: RecentHouseholdMember[];
  additionalColumns?: ColumnDef<RecentHouseholdMember>[];
}
const AssociatedHouseholdMembers = ({
  recentMembers,
  additionalColumns,
  ...props
}: Props) => {
  const columns: ColumnDef<RecentHouseholdMember>[] = useMemo(() => {
    return [
      CLIENT_COLUMNS.name,
      CLIENT_COLUMNS.age,
      { header: 'Project', render: (row) => row.projectName },
      {
        header: 'Date Associated',
        render: (row) => (
          <RelativeDate
            dateString={row.enrollment.entryDate}
            variant='body2'
            prefix='Enrolled&nbsp;'
            withTooltip
          />
        ),
      },
      ...(additionalColumns || []),
    ];
  }, [additionalColumns]);

  if (recentMembers.length === 0) return null;

  return (
    <SsnDobShowContextProvider>
      <GenericTable<RecentHouseholdMember>
        rows={recentMembers || []}
        columns={columns}
        rowSecondaryActionConfigs={(row) => [
          getViewClientMenuItem(row.client),
          getViewEnrollmentMenuItem(row.enrollment, row.client),
        ]}
        {...props}
      />
    </SsnDobShowContextProvider>
  );
};

export default AssociatedHouseholdMembers;
