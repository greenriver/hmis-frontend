import InProgressIcon from '@mui/icons-material/Timelapse';
import { Alert, AlertTitle, Stack } from '@mui/material';

const WipAssessmentAlert = () => {
  return (
    <Alert
      severity='warning'
      variant='outlined'
      icon={<InProgressIcon />}
      sx={{
        my: 2,
        '.MuiAlert-message': { width: '100%' },
        '.MuiAlert-icon': { alignItems: 'center' },
      }}
    >
      <Stack
        direction='row'
        justifyContent={'space-between'}
        display='flex'
        alignItems={'flex-end'}
        sx={{ width: '100%' }}
      >
        <AlertTitle>This assessment is in progress</AlertTitle>
      </Stack>
    </Alert>
  );
};
export default WipAssessmentAlert;
