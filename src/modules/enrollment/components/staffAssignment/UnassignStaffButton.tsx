import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react';
import {
  GetHouseholdStaffAssignmentHistoryDocument,
  GetHouseholdStaffAssignmentsDocument,
  useUnassignStaffMutation,
} from '@/types/gqlTypes';

interface UnassignButtonProps {
  staffAssignmentId: string;
}

const UnassignStaffButton: React.FC<UnassignButtonProps> = ({
  staffAssignmentId,
}) => {
  const [unassignStaff, { error, loading }] = useUnassignStaffMutation({
    variables: {
      staffAssignmentId: staffAssignmentId,
    },
    refetchQueries: [
      GetHouseholdStaffAssignmentsDocument,
      GetHouseholdStaffAssignmentHistoryDocument,
    ],
    awaitRefetchQueries: true,
  });

  if (error) throw error;

  return (
    <LoadingButton
      variant='outlined'
      loading={loading}
      onClick={() => unassignStaff()}
      color='secondary'
    >
      Unassign
    </LoadingButton>
  );
};

export default UnassignStaffButton;
