import { Box, Chip, Tooltip } from '@mui/material';
import React from 'react';
import { StaffAssignmentDetailsFragment } from '@/types/gqlTypes';

interface Props {
  staffAssignments: StaffAssignmentDetailsFragment[];
}

const HouseholdStaff: React.FC<Props> = ({ staffAssignments }) => {
  if (staffAssignments.length === 0) return null;

  const allNames = staffAssignments.map(
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
