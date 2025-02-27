import { Box, Chip, Tooltip } from '@mui/material';
import React from 'react';
import { HouseholdWithStaffAssignmentsFragment } from '@/types/gqlTypes';

interface Props {
  household: HouseholdWithStaffAssignmentsFragment;
}

const HouseholdStaff: React.FC<Props> = ({ household }) => {
  if (!household.staffAssignments?.nodes.length) return;

  const allNames = household.staffAssignments.nodes.map(
    (staffAssignment) => staffAssignment.user.name
  );

  const first = allNames[0];
  const rest = allNames.slice(1);

  return (
    <Box aria-label={allNames.join(', ')}>
      {first}{' '}
      {rest.length > 0 && (
        <Tooltip arrow title={rest.join(', ')}>
          <Chip sx={{ mb: 0.5 }} size='small' label={`+${rest.length} more`} />
        </Tooltip>
      )}
    </Box>
  );
};
export default HouseholdStaff;
