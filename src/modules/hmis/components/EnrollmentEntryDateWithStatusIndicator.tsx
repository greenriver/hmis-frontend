import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Stack, Tooltip, Typography } from '@mui/material';

import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentFieldsFragment,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

const EnrollmentEntryDateWithStatusIndicator = ({
  enrollment,
}: {
  enrollment:
    | EnrollmentFieldsFragment
    | HouseholdClientFieldsFragment['enrollment'];
}) => {
  if (!enrollment.inProgress) {
    return parseAndFormatDate(enrollment.entryDate);
  }

  return (
    <Stack direction='row' alignItems='center' gap={0.8}>
      <Typography variant='inherit' color='error'>
        {parseAndFormatDate(enrollment.entryDate)}
      </Typography>
      <Tooltip
        title='Incomplete Enrollment. Please submit intake assessment.'
        arrow
        describeChild
      >
        <ErrorOutlineIcon color='error' fontSize='small' />
      </Tooltip>
    </Stack>
  );
};

export default EnrollmentEntryDateWithStatusIndicator;
