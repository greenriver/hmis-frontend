import SubmittedIcon from '@mui/icons-material/CheckCircle';
import UnlockIcon from '@mui/icons-material/Lock';
import { Alert, AlertTitle, Button, Stack } from '@mui/material';

const LockedAssessmentAlert = ({
  allowUnlock,
  onUnlock,
}: {
  allowUnlock?: boolean;
  onUnlock?: VoidFunction;
}) => {
  return (
    <Alert
      severity='success'
      icon={<SubmittedIcon />}
      variant='outlined'
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
        <AlertTitle>This assessment has been submitted.</AlertTitle>
        {allowUnlock && (
          <Button
            startIcon={<UnlockIcon />}
            variant='contained'
            data-testid='unlockAssessmentButton'
            onClick={onUnlock}
            color='inherit'
            sx={{ fontWeight: 600 }}
          >
            Unlock to make changes
          </Button>
        )}
      </Stack>
    </Alert>
  );
};
export default LockedAssessmentAlert;
