import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import TimerIcon from '@mui/icons-material/Timer';
import { Stack, Typography } from '@mui/material';

import { EnrollmentFieldsFragment } from '@/types/gqlTypes';

const EnrollmentStatus = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  let Icon = TimerIcon;
  let color: 'disabled' | 'error' | 'secondary' = 'disabled';
  let text = 'Closed';
  let textColor = 'gray';
  if (enrollment.inProgress) {
    Icon = ErrorOutlineIcon;
    color = 'error';
    text = 'Incomplete';
    textColor = color;
  } else if (!enrollment.exitDate) {
    Icon = HistoryIcon;
    color = 'secondary';
    text = 'Active';
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
