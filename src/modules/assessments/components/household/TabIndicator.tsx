import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';
import PendingIcon from '@mui/icons-material/Pending';
import { Box, Stack, Typography } from '@mui/material';

import { AssessmentStatus } from './types';

const TabIndicator = ({ status }: { status: AssessmentStatus }) => {
  let Icon;
  let color:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'disabled'
    | undefined;

  let text;
  switch (status) {
    case AssessmentStatus.NotStarted:
      Icon = CancelIcon;
      text = 'Not Started';
      break;
    case AssessmentStatus.Started:
      Icon = PendingIcon;
      text = 'In Progress';
      color = 'warning';
      break;
    case AssessmentStatus.ReadyToSubmit:
      Icon = CheckCircleIcon;
      text = 'Ready to Submit';
      color = 'success';
      break;
    case AssessmentStatus.Submitted:
      Icon = LockIcon;
      text = 'Submitted';
      color = 'disabled';
      break;
    case AssessmentStatus.Warning:
      Icon = ErrorOutlineIcon;
      text = 'Warning';
      color = 'warning';
      break;
    case AssessmentStatus.Error:
      Icon = ErrorIcon;
      text = 'Error';
      color = 'error';
      break;
  }

  return (
    <Stack direction='row' alignItems='center' alignSelf='center' gap={0.8}>
      <Box component='span' sx={{ fontSize: 16, display: 'flex' }}>
        <Icon fontSize='inherit' color={color || 'inherit'} />
      </Box>
      <Typography
        variant='subtitle2'
        fontSize={'.8rem'}
        // color='text.primary'
        // color={(theme) =>
        //   color ? darken(theme.palette[color].main, 0.3) : 'text.primary'
        // }
        sx={{ fontWeight: 600 }}
      >
        {text}
      </Typography>
    </Stack>
  );
};

export default TabIndicator;
