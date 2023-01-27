import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Stack, Typography } from '@mui/material';

import { AssessmentStatus } from './HouseholdAssessments';

const TabIndicator = ({ status }: { status: AssessmentStatus }) => {
  return (
    <Stack direction='row' alignItems='center' gap={1}>
      {status === 'not-started' && (
        <>
          <CancelIcon fontSize='small' />
          <Typography variant='subtitle2'>Not Started</Typography>
        </>
      )}
      {status === 'started' && (
        <>
          <PendingIcon fontSize='small' />
          <Typography variant='subtitle2'>Started</Typography>
        </>
      )}
      {status === 'submitted' && (
        <>
          <CheckCircleIcon fontSize='small' />
          <Typography variant='subtitle2'>Completed</Typography>
        </>
      )}
    </Stack>
  );
};

export default TabIndicator;
