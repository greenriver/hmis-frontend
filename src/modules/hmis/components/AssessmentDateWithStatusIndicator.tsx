import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Stack, Tooltip, Typography } from '@mui/material';

import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AssessmentFieldsFragment } from '@/types/gqlTypes';

const AssessmentDateWithStatusIndicator = ({
  assessment,
}: {
  assessment: AssessmentFieldsFragment;
}) => {
  if (!assessment.inProgress) {
    return parseAndFormatDate(assessment.assessmentDate);
  }

  return (
    <Stack direction='row' alignItems='center' gap={0.8}>
      <Typography variant='inherit' color='error'>
        {parseAndFormatDate(assessment.assessmentDate)}
      </Typography>
      <Tooltip title='Assessment has not been submitted.' arrow describeChild>
        <ErrorOutlineIcon color='error' fontSize='small' />
      </Tooltip>
    </Stack>
  );
};

export default AssessmentDateWithStatusIndicator;
