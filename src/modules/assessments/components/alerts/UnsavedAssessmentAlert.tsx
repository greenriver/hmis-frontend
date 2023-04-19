import { Alert, AlertTitle, Box, Stack } from '@mui/material';

const WipAssessmentAlert = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity='info'
        sx={{
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
          <AlertTitle>This assessment has not been saved.</AlertTitle>
        </Stack>
      </Alert>
    </Box>
  );
};
export default WipAssessmentAlert;
