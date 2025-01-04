import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import TimerIcon from '@mui/icons-material/Timer';
import { Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Enrollment, Household } from '@/types/gqlTypes';

interface CommonStatusProps {
  variant: 'inProgress' | 'open' | 'autoExited' | 'exited';
}

const CommonStatus: React.FC<CommonStatusProps> = ({ variant }) => {
  const statusProps = useMemo(() => {
    switch (variant) {
      case 'inProgress':
        return {
          Icon: ErrorOutlineIcon,
          text: 'Incomplete',
          textColor: 'error',
        };
      case 'open':
        return {
          Icon: HistoryIcon,
          text: 'Open',
          textColor: 'activeStatus',
        };
      case 'autoExited':
        return {
          Icon: TimerIcon,
          text: 'Auto-Exited',
          textColor: 'text.secondary',
        };
      default:
        return {
          Icon: TimerIcon,
          text: 'Exited',
          textColor: 'text.secondary',
        };
    }
  }, [variant]);

  return (
    <Typography
      component='div'
      variant='body2'
      color={statusProps.textColor}
      sx={{ textDecoration: 'none' }}
    >
      <Stack direction='row' alignItems='center' gap={0.8}>
        <statusProps.Icon fontSize='small' />
        {statusProps.text}
      </Stack>
    </Typography>
  );
};

const EnrollmentStatus = ({
  enrollment,
}: {
  enrollment: Pick<Enrollment, 'inProgress' | 'autoExited' | 'exitDate'>;
}) => {
  if (enrollment.inProgress) return <CommonStatus variant='inProgress' />;
  if (enrollment.autoExited) return <CommonStatus variant='autoExited' />;
  if (!enrollment.exitDate) return <CommonStatus variant='open' />;
  return <CommonStatus variant='exited' />;
};

export const HouseholdStatus = ({
  household,
}: {
  household: Pick<Household, 'anyInProgress' | 'latestExitDate'>;
}) => {
  if (household.anyInProgress) return <CommonStatus variant='inProgress' />;
  if (!household.latestExitDate) return <CommonStatus variant='open' />;
  return <CommonStatus variant='exited' />;
};

export default EnrollmentStatus;
