import { Alert, AlertTitle } from '@mui/material';

const WipAssessmentAlert = () => {
  return (
    <Alert
      severity='info'
      sx={{
        my: 2,
        '.MuiAlert-message': { width: '100%' },
        '.MuiAlert-icon': { alignItems: 'center' },
      }}
      variant='outlined'
    >
      <AlertTitle>This assessment has not been saved.</AlertTitle>
    </Alert>
  );
};
export default WipAssessmentAlert;
