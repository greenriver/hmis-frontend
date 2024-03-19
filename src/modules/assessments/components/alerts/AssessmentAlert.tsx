import UnlockIcon from '@mui/icons-material/Lock';
import NotStartedIcon from '@mui/icons-material/PendingOutlined';
import InProgressIcon from '@mui/icons-material/Timelapse';
import { Alert, AlertColor, AlertTitle, Button, Stack } from '@mui/material';
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { FullAssessmentFragment } from '@/types/gqlTypes';

interface Props {
  assessment?: FullAssessmentFragment;
  locked?: boolean;
  allowUnlock?: boolean;
  onUnlock?: VoidFunction;
}
const AssessmentAlert: React.FC<Props> = ({
  assessment,
  locked,
  allowUnlock,
  onUnlock,
}) => {
  const isTiny = useIsMobile('sm');

  let text;
  let Icon;
  let severity: AlertColor | undefined;
  let action;
  if (!assessment) {
    text = 'This assessment has not been started.';
    Icon = NotStartedIcon;
  } else if (assessment.inProgress) {
    text = 'This assessment is in progress.';
    Icon = InProgressIcon;
    severity = 'warning';
  } else if (locked) {
    text = 'This assessment has been submitted.';
    Icon = UnlockIcon;
    severity = 'success';
    action = allowUnlock ? (
      <Button
        startIcon={<UnlockIcon />}
        variant='contained'
        data-testid='unlockAssessmentButton'
        onClick={onUnlock}
        color='inherit'
        sx={{ fontWeight: 600, width: isTiny ? '100%' : 'fit-content' }}
      >
        Unlock Assessment
      </Button>
    ) : null;
  }

  // this should probably be its own "severity" for
  const grayAlertSx = {
    borderColor: 'text.secondary',
    color: 'text.primary',
    '.MuiAlert-icon': { alignItems: 'center', color: 'text.secondary' },
  };

  // If an Icon is provided for the Alert, but there's also an Icon on the
  // Button, then on mobile screens it looks better if we omit the Alert icon
  const omitIcon = isTiny && action?.props.startIcon;

  if (!text) return null;

  return (
    <Alert
      severity={severity}
      variant='outlined'
      icon={Icon && !omitIcon ? <Icon /> : false}
      sx={{
        my: 2,
        '.MuiAlert-message': { width: '100%' },
        '.MuiAlert-icon': { alignItems: 'center' },
        ...(assessment ? undefined : grayAlertSx),
      }}
    >
      <Stack
        direction={isTiny ? 'column' : 'row'}
        justifyContent={'space-between'}
        display='flex'
        alignItems={'flex-end'}
        sx={{ width: '100%' }}
      >
        <AlertTitle sx={action ? undefined : { mb: 0 }}>{text}</AlertTitle>
        {action}
      </Stack>
    </Alert>
  );
};
export default AssessmentAlert;
