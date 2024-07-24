import {
  Box,
  Button,
  Card,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import ExpandInfoButton from '@/components/elements/ExpandInfoButton';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import NewStaffAssignmentForm from '@/modules/enrollment/components/staffAssignment/NewStaffAssignmentForm';
import StaffAssignmentHistory from '@/modules/enrollment/components/staffAssignment/StaffAssignmentHistory';
import UnassignStaffButton from '@/modules/enrollment/components/staffAssignment/UnassignStaffButton';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import {
  clientBriefName,
  parseAndFormatDate,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import {
  AllEnrollmentDetailsFragment,
  HouseholdWithStaffAssignmentsFragment,
  RelationshipToHoH,
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
      <UnassignStaffButton
        staffAssignmentId={assignment.id}
        householdId={assignment.household.id}
      />
    ),
  },
};

interface EditStaffAssignmentDialogProps {
  household: HouseholdWithStaffAssignmentsFragment;
  enrollment: AllEnrollmentDetailsFragment;
  open: boolean;
  onClose: VoidFunction;
}

// todo @martha - this shouldnt render and make all its requests unless the edit dialog actually is open
const EditStaffAssignmentDialog: React.FC<EditStaffAssignmentDialogProps> = ({
  household,
  enrollment,
  open,
  onClose,
}) => {
  const headOfHousehold = useMemo(() => {
    return household.householdClients.find(
      (c) => c.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    );
  }, [household.householdClients]);

  const isTiny = useIsMobile('sm');

  const [historyExpanded, setHistoryExpanded] = useState(false);

  if (!headOfHousehold) return;

  return (
    <CommonDialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>Manage Staff Assignments</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ mt: 2 }}>
          <Stack direction={isTiny ? 'column' : 'row'} gap={isTiny ? 2 : 4}>
            <CommonLabeledTextBlock title='Head of Household'>
              {clientBriefName(headOfHousehold.client)}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Project'>
              {enrollment.project.projectName}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Enrollment Period'>
              <EnrollmentDateRangeWithStatus enrollment={enrollment} />
            </CommonLabeledTextBlock>
          </Stack>
          <NewStaffAssignmentForm
            householdId={household.id}
            projectId={enrollment.project.id}
          />
          <Typography
            id='current-staff-assignments'
            sx={{ mt: 1 }}
            variant='h5'
            component='h3'
          >
            Current Staff Assignments
          </Typography>
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
          <Box>
            <ExpandInfoButton
              expanded={historyExpanded}
              onClick={() => setHistoryExpanded(!historyExpanded)}
            >
              Show staff assignment history
            </ExpandInfoButton>
            <Collapse in={historyExpanded}>
              <StaffAssignmentHistory householdId={household.id} />
            </Collapse>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ gap: 2 }}>
        <Button variant='gray' onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CommonDialog>
  );
};

export default EditStaffAssignmentDialog;
