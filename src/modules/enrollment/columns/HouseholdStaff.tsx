import React from 'react';
import CommonTruncatedList from '@/components/elements/CommonTruncatedList';
import { StaffAssignmentDetailsFragment } from '@/types/gqlTypes';

interface Props {
  staffAssignments: StaffAssignmentDetailsFragment[];
}

const HouseholdStaff: React.FC<Props> = ({ staffAssignments }) => {
  const allNames = staffAssignments.map(
    (staffAssignment) => staffAssignment.user.name
  );

  return <CommonTruncatedList items={allNames} />;
};

export default HouseholdStaff;
