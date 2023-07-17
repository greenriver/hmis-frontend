import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';

const EnrollmentNavHeader = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  return (
    <Stack>
      <Typography>{enrollment.project.projectName}</Typography>
      <Typography>
        {parseAndFormatDateRange(enrollment.entryDate, enrollment.exitDate)}
      </Typography>
      <Typography>{enrollment.id}</Typography>
    </Stack>
  );
};
export default EnrollmentNavHeader;
