import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react';
import { cache } from '@/providers/apolloClient';
import { useUnassignStaffMutation } from '@/types/gqlTypes';

interface UnassignButtonProps {
  staffAssignmentId: string;
  householdId: string;
}

const UnassignStaffButton: React.FC<UnassignButtonProps> = ({
  staffAssignmentId,
  householdId,
}) => {
  const [unassignStaff, { error, loading }] = useUnassignStaffMutation({
    variables: {
      staffAssignmentId: staffAssignmentId,
    },
    onCompleted: (data) => {
      if (data.unassignStaff?.staffAssignment) {
        // evictQuery('household'); is much simpler, but causes a visual delay
        cache.modify({
          id: `Household:${householdId}`,
          fields: {
            staffAssignments(existingStaffAssignments, { storeFieldName }) {
              if (storeFieldName.includes('{"isCurrentlyAssigned":false}')) {
                // Add the newly unassigned to the results of the Staff Assignment History query
                return {
                  ...existingStaffAssignments,
                  nodesCount: existingStaffAssignments.nodesCount + 1,
                  nodes: [
                    {
                      __ref: `StaffAssignment:${data.unassignStaff?.staffAssignment?.id}`,
                    },
                    ...existingStaffAssignments.nodes,
                  ],
                };
              } else {
                // Remove it from the current assignments list
                return {
                  ...existingStaffAssignments,
                  nodesCount: existingStaffAssignments.nodesCount + 1,
                  nodes: existingStaffAssignments.nodes.filter(
                    (a: { __ref: string }) => {
                      return (
                        a.__ref !==
                        `StaffAssignment:${data.unassignStaff?.staffAssignment?.id}`
                      );
                    }
                  ),
                };
              }
            },
          },
        });
      }
    },
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
