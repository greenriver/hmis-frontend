import { useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import { HOUSEHOLD_MEMBER_COLUMNS } from '@/modules/household/components/HouseholdMemberTable';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';

/**
 * Overview table showing all members that belong to a given household,
 * shown on the Enrollment Overview page
 */

interface Props {
  enrollmentId: string;
}
const HouseholdOverviewTable: React.FC<Props> = ({ enrollmentId }) => {
  const [householdMembers, { loading: householdMembersLoading, error }] =
    useHouseholdMembers(enrollmentId);

  const columns = useMemo(() => {
    if (!householdMembers) return;

    const cols = [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.linkedClientName({
        currentEnrollmentId: enrollmentId,
      }),

      HOUSEHOLD_MEMBER_COLUMNS.relationshipToHoh,
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentStatus,
    ];

    return cols;
  }, [enrollmentId, householdMembers]);

  if (error) throw error;
  if (householdMembersLoading && !householdMembers) return <Loading />;

  return (
    <SsnDobShowContextProvider>
      <GenericTable<HouseholdClientFieldsFragment>
        rows={householdMembers || []}
        columns={columns}
        rowSx={() => ({
          td: { py: 1, border: 'unset' },
          '&:nth-last-of-type(1) td': { pb: 2 }, // extra padding after last row
          '&:first-of-type td': { pt: 2 }, // extra padding before first row
          'td:nth-of-type(1)': { pl: 1, pr: 0 }, // HoH indicator column
        })}
      />
    </SsnDobShowContextProvider>
  );
};

export default HouseholdOverviewTable;
