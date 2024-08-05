import { memo } from 'react';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import { HouseholdWithEnrollmentFieldsFragment } from '@/types/gqlTypes';

interface Props {
  household: HouseholdWithEnrollmentFieldsFragment;
}

const HouseholdStatus: React.FC<Props> = ({ household }) => {
  // When showing the status for the household, show the 'most important' status - Incomplete, Open, or Exited.
  // Do this by sorting the enrollments by 'most important' status and then rendering
  // the EnrollmentStatus component for the first one in the sorted list
  const orderedEnrollments = household.householdClients
    .map((householdClient) => householdClient.enrollment)
    .sort((enrollment1, enrollment2) => {
      if (enrollment1.inProgress) return -1;
      if (enrollment2.inProgress) return 1;
      if (enrollment1.exitDate) return 1;
      if (enrollment2.exitDate) return -1;
      return 0;
    });

  if (!orderedEnrollments.length) return;

  return <EnrollmentStatus enrollment={orderedEnrollments[0]} />;
};

const MemoizedHouseholdStatus = memo(HouseholdStatus);

export { MemoizedHouseholdStatus as HouseholdStatus };
