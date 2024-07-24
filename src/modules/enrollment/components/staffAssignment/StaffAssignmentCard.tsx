import EditIcon from '@mui/icons-material/Edit';
import { Divider, Stack, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import IconButtonContainer from '@/modules/enrollment/components/IconButtonContainer';
import EditStaffAssignmentDialog from '@/modules/enrollment/components/staffAssignment/EditStaffAssignmentDialog';
import {
  RelationshipToHoH,
  StaffAssignmentDetailsFragment,
  useGetHouseholdStaffAssignmentsQuery,
} from '@/types/gqlTypes';

interface StaffAssignmentCardProps {
  householdId: string;
}

const StaffAssignmentCard: React.FC<StaffAssignmentCardProps> = ({
  householdId,
}) => {
  const {
    data: { household } = {},
    loading,
    error,
  } = useGetHouseholdStaffAssignmentsQuery({
    variables: { id: householdId },
  }); // todo @Martha - why is this query repeated twice?

  const assignmentsByType = useMemo(() => {
    if (!household || !household.staffAssignments) return {};

    return household.staffAssignments.nodes.reduce(
      (
        map: Record<string, StaffAssignmentDetailsFragment[]>,
        a: StaffAssignmentDetailsFragment
      ) => {
        const l = map[a.staffAssignmentType];
        map[a.staffAssignmentType] = l ? [...l, a] : [a];
        return map;
      },
      {}
    );
  }, [household]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { enrollment } = useEnrollmentDashboardContext();

  if (!enrollment) return;
  if (error) throw error;

  return (
    <>
      {household && editDialogOpen && (
        <EditStaffAssignmentDialog
          household={household}
          enrollment={enrollment}
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
      <TitleCard
        title='Staff Assignment'
        actions={
          enrollment.relationshipToHoH ===
            RelationshipToHoH.SelfHeadOfHousehold && (
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
              <Typography sx={{ p: 2 }} color='text.secondary'>
                No Staff Assigned
              </Typography>
            )}
            <CommonDetailGridContainer>
              {Object.entries(assignmentsByType).map(([type, assignments]) => (
                <CommonDetailGridItem
                  label={type}
                  key={type}
                  sx={{ alignItems: 'top' }}
                >
                  <Stack spacing={1}>
                    {assignments.map((a) => (
                      <Typography variant='body2' key={a.id}>
                        {a.user.name}
                      </Typography>
                    ))}
                  </Stack>
                </CommonDetailGridItem>
              ))}
            </CommonDetailGridContainer>
          </>
        )}
      </TitleCard>
    </>
  );
};

export default StaffAssignmentCard;
