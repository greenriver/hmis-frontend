import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import TimerIcon from '@mui/icons-material/Timer';
import { Stack, Typography } from '@mui/material';

import { entryExitRange } from '@/modules/hmis/hmisUtil';
import {
  EnrollmentFieldsFragment,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';
type Colors =
  | 'disabled'
  | 'error'
  | 'secondary'
  | 'text.secondary'
  | 'text.primary';

const EnrollmentStatus = ({
  enrollment,
  hideIcon = false,
  withActiveRange = false,
  activeColor = 'secondary',
  closedColor = 'text.secondary',
}: {
  enrollment:
    | EnrollmentFieldsFragment
    | HouseholdClientFieldsFragment['enrollment'];
  hideIcon?: boolean;
  withActiveRange?: boolean;
  activeColor?: Colors;
  closedColor?: Colors;
}) => {
  let Icon = TimerIcon;
  let color: 'disabled' | 'error' | 'secondary' = 'disabled';
  let text = 'Exited';
  let textColor = closedColor;

  if (enrollment.inProgress) {
    Icon = ErrorOutlineIcon;
    color = 'error';
    text = 'Incomplete';
    textColor = color;
  } else if (!enrollment.exitDate) {
    Icon = HistoryIcon;
    color = 'secondary';
    text = 'Open';
    textColor = activeColor;
  }

  if (withActiveRange) {
    const range = entryExitRange(
      enrollment,
      enrollment.inProgress ? 'Incomplete' : undefined
    );
    if (range) text = range;
  }
  return (
    <Stack direction='row' alignItems='center' gap={0.8}>
      {!hideIcon && <Icon color={color} fontSize='small' />}
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
