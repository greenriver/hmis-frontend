import { useMemo } from 'react';

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

import { RecentHouseholdMember } from '@/modules/household/types';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';

interface Props extends Omit<
  GenericTableProps<RecentHouseholdMember>,
  'rows' | 'columns'
> {
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
      { header: 'Project', key: 'project', render: (row) => row.projectName },
      {
        header: 'Date Associated',
        key: 'dateAssociated',
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

  if (!recentMembers || recentMembers.length === 0) return null;

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
