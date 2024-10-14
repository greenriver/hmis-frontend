import EditIcon from '@mui/icons-material/Edit';
import { Divider, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import IconButtonContainer from '@/modules/enrollment/components/IconButtonContainer';
import EditStaffAssignmentDialog from '@/modules/enrollment/components/staffAssignment/EditStaffAssignmentDialog';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
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

  const staffAssignmentRows = useMemo(() => {
    if (!household?.staffAssignments?.nodesCount) return;

    // { relationship => [user1, user2] }
    const staff: Record<string, string[]> = {};
    household.staffAssignments.nodes.forEach(
      ({ staffAssignmentRelationship, user }) => {
        staff[staffAssignmentRelationship] ||= [];
        staff[staffAssignmentRelationship].push(user.name);
      }
    );
    // sort by relationship alphabetically
    return Object.entries(staff).sort(([a], [b]) => a.localeCompare(b));
  }, [household]);

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
            {staffAssignmentRows && (
              <CommonDetailGridContainer>
                {staffAssignmentRows.map(([relationship, users]) => (
                  <CommonDetailGridItem label={relationship} key={relationship}>
                    {users.map((user) => (
                      <div key={user}>{user}</div>
                    ))}
                  </CommonDetailGridItem>
                ))}
              </CommonDetailGridContainer>
            )}
          </>
        )}
      </TitleCard>
    </>
  );
};

export default StaffAssignmentCard;
