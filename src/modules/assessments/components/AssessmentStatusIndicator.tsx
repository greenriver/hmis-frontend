import { SvgIconComponent } from '@mui/icons-material';
import ReadyToSubmitIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import SubmittedIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotStartedIcon from '@mui/icons-material/PendingOutlined';
import InProgressIcon from '@mui/icons-material/Timelapse';

import { Stack, SvgIconProps, Typography } from '@mui/material';
import { AssessmentStatus } from './household/util';

const Display: React.FC<{
  icon: SvgIconComponent;
  caption: string;
  color: SvgIconProps['color'];
}> = ({ icon, caption, color }) => {
  const Icon = icon;
  return (
    <Stack direction='row' spacing={0.5} alignItems='center'>
      <Icon color={color} sx={{ fontSize: 16 }} />
      <Typography component='div' variant='caption'>
        {caption}
      </Typography>
    </Stack>
  );
};

const AssessmentStatusIndicator = ({
  status,
}: {
  status: AssessmentStatus;
}) => {
  switch (status) {
    case AssessmentStatus.NotStarted:
      return (
        <Display icon={NotStartedIcon} color='disabled' caption='Not Started' />
      );
    case AssessmentStatus.Started:
      return (
        <Display
          icon={InProgressIcon}
          color='warning'
          caption='Ready to Submit'
        />
      );
    case AssessmentStatus.ReadyToSubmit:
      return (
        <Display
          icon={ReadyToSubmitIcon}
          color='primary'
          caption='Ready to Submit'
        />
      );
    case AssessmentStatus.Submitted:
      return (
        <Display icon={SubmittedIcon} color='success' caption='Submitted' />
      );
    case AssessmentStatus.Warning:
      return (
        <Display icon={ErrorOutlineIcon} color='warning' caption='Has Issues' />
      );
    case AssessmentStatus.Error:
      return <Display icon={ErrorIcon} color='error' caption='Has Issues' />;
  }
};

export default AssessmentStatusIndicator;
