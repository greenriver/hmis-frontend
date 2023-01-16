import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TimerIcon from '@mui/icons-material/Timer';
import { Stack, Typography } from '@mui/material';

import { AssessmentFieldsFragment } from '@/types/gqlTypes';

const EnrollmentStatus = ({
  assessment,
}: {
  assessment: AssessmentFieldsFragment;
}) => {
  let Icon = TimerIcon;
  let color: 'disabled' | 'error' | 'secondary' = 'disabled';
  let text = 'Completed';
  let textColor = 'gray';
  if (assessment.inProgress) {
    Icon = ErrorOutlineIcon;
    color = 'error';
    text = 'Incomplete';
    textColor = color;
  }
  return (
    <Stack direction='row' alignItems='center' gap={0.8}>
      <Icon color={color} fontSize='small' />
      <Typography
        variant='body2'
        color={textColor}
        sx={{ textDecoration: 'none' }}
      >
        {text}
      </Typography>
    </Stack>
  );
};

export default EnrollmentStatus;
