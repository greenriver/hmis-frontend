import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import React, { useMemo } from 'react';
import NewStaffAssignmentForm from './NewStaffAssignmentForm';
import StaffAssignmentHistory from './StaffAssignmentHistory';
import StaffAssignmentTable from './StaffAssignmentTable';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { useIsMobile } from '@/hooks/useIsMobile';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  HouseholdWithStaffAssignmentsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface EditStaffAssignmentDialogProps {
  household: HouseholdWithStaffAssignmentsFragment;
  open: boolean;
  onClose: VoidFunction;
}

const EditStaffAssignmentDialog: React.FC<EditStaffAssignmentDialogProps> = ({
  household,
  open,
  onClose,
}) => {
  const isTiny = useIsMobile('sm');

  const headOfHousehold = useMemo(() => {
    return household.householdClients.find(
      (c) => c.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    );
  }, [household.householdClients]);

  const { enrollment } = useEnrollmentDashboardContext();

  if (!enrollment) return;
  if (!headOfHousehold) return;

  return (
    <CommonDialog fullWidth open={open} onClose={onClose} maxWidth='md'>
      <DialogTitle>Manage Staff Assignments</DialogTitle>
      <DialogContent>
        <Stack gap={3} sx={{ mt: 2 }}>
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
          <StaffAssignmentTable household={household} />
          <StaffAssignmentHistory householdId={household.id} />
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
