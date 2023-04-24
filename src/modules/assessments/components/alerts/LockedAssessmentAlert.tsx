import LockIcon from '@mui/icons-material/Lock';
import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material';

const LockedAssessmentAlert = ({
  allowUnlock,
  onUnlock,
}: {
  allowUnlock?: boolean;
  onUnlock?: VoidFunction;
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity='info'
        icon={<LockIcon />}
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
          <AlertTitle>This assessment has been submitted.</AlertTitle>
          {allowUnlock && (
            <Button
              data-testid='unlockAssessmentButton'
              variant='text'
              onClick={onUnlock}
              sx={{ fontWeight: 600 }}
            >
              Unlock to make changes
            </Button>
          )}
        </Stack>
      </Alert>
    </Box>
  );
};
export default LockedAssessmentAlert;
