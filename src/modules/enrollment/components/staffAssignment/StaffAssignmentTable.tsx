import { Card } from '@mui/material';
import React from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import UnassignStaffButton from '@/modules/enrollment/components/staffAssignment/UnassignStaffButton';
import {
  parseAndFormatDate,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import {
  HouseholdWithStaffAssignmentsFragment,
  StaffAssignmentDetailsFragment,
} from '@/types/gqlTypes';

export const STAFF_ASSIGNMENT_COLUMNS: Record<
  string,
  ColumnDef<StaffAssignmentDetailsFragment>
> = {
  staffName: {
    header: 'Staff Name',
    render: (assignment) => assignment.user.name,
  },
  role: {
    header: 'Role',
    render: (assignment) => assignment.staffAssignmentType,
  },
  assignmentDate: {
    header: 'Assignment Date',
    render: (assignment) => parseAndFormatDate(assignment.assignedAt),
  },
  assignmentDateRange: {
    header: 'Assignment Dates',
    render: (assignment) =>
      parseAndFormatDateRange(assignment.assignedAt, assignment.unassignedAt),
  },
  action: {
    header: 'Action',
    render: (assignment) => (
      <UnassignStaffButton staffAssignmentId={assignment.id} />
    ),
  },
};

interface StaffAssignmentTableProps {
  household: HouseholdWithStaffAssignmentsFragment;
}

const StaffAssignmentTable: React.FC<StaffAssignmentTableProps> = ({
  household,
}) => {
  return (
    <Card>
      <GenericTable<StaffAssignmentDetailsFragment>
        rows={household.staffAssignments?.nodes || []}
        columns={[
          STAFF_ASSIGNMENT_COLUMNS.staffName,
          STAFF_ASSIGNMENT_COLUMNS.role,
          STAFF_ASSIGNMENT_COLUMNS.assignmentDate,
          STAFF_ASSIGNMENT_COLUMNS.action,
        ]}
        noData={'No Staff Assigned'}
        tableProps={{ 'aria-label': 'Current staff assignments' }}
      />
    </Card>
  );
};

export default StaffAssignmentTable;
