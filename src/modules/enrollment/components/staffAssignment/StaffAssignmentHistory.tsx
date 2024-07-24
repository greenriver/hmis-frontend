import { Card } from '@mui/material';
import React from 'react';
import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { STAFF_ASSIGNMENT_COLUMNS } from '@/modules/enrollment/components/staffAssignment/EditStaffAssignmentDialog';
import {
  StaffAssignmentDetailsFragment,
  useGetHouseholdStaffAssignmentHistoryQuery,
} from '@/types/gqlTypes';

interface StaffAssignmentHistoryProps {
  householdId: string;
}
const StaffAssignmentHistory: React.FC<StaffAssignmentHistoryProps> = ({
  householdId,
}) => {
  const {
    data: { household } = {},
    loading,
    error,
  } = useGetHouseholdStaffAssignmentHistoryQuery({
    variables: { id: householdId },
  });

  if (loading) return <Loading />;
  if (error) throw error;
  if (!household) return;

  return (
    <Card>
      <GenericTable<StaffAssignmentDetailsFragment>
        rows={household.staffAssignments?.nodes || []}
        columns={[
          STAFF_ASSIGNMENT_COLUMNS.staffName,
          STAFF_ASSIGNMENT_COLUMNS.role,
          STAFF_ASSIGNMENT_COLUMNS.assignmentDateRange,
        ]}
        noData={'No Assignment History'}
        tableProps={{ 'aria-label': 'Staff assignment history' }}
      />
    </Card>
  );
};

export default StaffAssignmentHistory;
