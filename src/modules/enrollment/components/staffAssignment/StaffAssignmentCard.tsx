import EditIcon from '@mui/icons-material/Edit';
import { Divider, Typography } from '@mui/material';
import React, { useState } from 'react';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import IconButtonContainer from '@/modules/enrollment/components/IconButtonContainer';
import EditStaffAssignmentDialog from '@/modules/enrollment/components/staffAssignment/EditStaffAssignmentDialog';
import StaffAssignmentTable, {
  STAFF_ASSIGNMENT_COLUMNS,
} from '@/modules/enrollment/components/staffAssignment/StaffAssignmentTable';
import {
  RelationshipToHoH,
  useGetHouseholdStaffAssignmentsQuery,
} from '@/types/gqlTypes';

interface StaffAssignmentCardProps {
  householdId: string;
}

const StaffAssignmentCard: React.FC<StaffAssignmentCardProps> = ({
  householdId,
}) => {
  const { enrollment } = useEnrollmentDashboardContext();

  const {
    data: { household } = {},
    loading,
    error,
  } = useGetHouseholdStaffAssignmentsQuery({
    variables: { id: householdId },
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!enrollment) return;
  if (error) throw error;

  return (
    <>
      {household && editDialogOpen && (
        <EditStaffAssignmentDialog
          household={household}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
      <TitleCard
        title='Staff Assignment'
        actions={
          enrollment.relationshipToHoH ===
            RelationshipToHoH.SelfHeadOfHousehold &&
          enrollment?.access?.canEditEnrollments && (
            <IconButtonContainer
              onClick={() => setEditDialogOpen(true)}
              Icon={EditIcon}
              ButtonProps={{ 'aria-label': `Edit Staff Assignment` }}
            />
          )
        }
      >
        {loading && <Loading />}
        {!loading && household?.staffAssignments && (
          <>
            <Divider />
            {household.staffAssignments.nodesCount === 0 && (
              <Typography variant='body2' sx={{ p: 2 }} color='text.secondary'>
                No staff assigned
              </Typography>
            )}
            {household.staffAssignments.nodesCount > 0 && (
              <StaffAssignmentTable
                household={household}
                columns={[
                  STAFF_ASSIGNMENT_COLUMNS.staffName,
                  STAFF_ASSIGNMENT_COLUMNS.role,
                  STAFF_ASSIGNMENT_COLUMNS.assignmentDate,
                ]}
                cardSx={{ border: 'none' }}
              />
            )}
          </>
        )}
      </TitleCard>
    </>
  );
};

export default StaffAssignmentCard;
