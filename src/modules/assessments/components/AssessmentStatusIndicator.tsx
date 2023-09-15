import { SvgIconComponent } from '@mui/icons-material';
import SubmittedIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotStartedIcon from '@mui/icons-material/PendingOutlined';
import InProgressIcon from '@mui/icons-material/Timelapse';

import { Stack, SvgIconProps, Typography } from '@mui/material';
import { AssessmentStatus } from './household/util';

interface DisplayProps {
  icon: SvgIconComponent;
  caption: string;
  color: SvgIconProps['color'];
  size?: 'small' | 'default';
}
const Display: React.FC<DisplayProps> = ({ icon, caption, color, size }) => {
  const Icon = icon;
  return (
    <Stack direction='row' spacing={1} alignItems='center'>
      <Icon color={color} sx={{ fontSize: size == 'small' ? 16 : 20 }} />
      <Typography
        component='div'
        variant={size == 'default' ? 'body2' : 'caption'}
      >
        {caption}
      </Typography>
    </Stack>
  );
};

interface Props {
  status: AssessmentStatus | undefined;
  size?: 'small' | 'default';
}

const AssessmentStatusIndicator: React.FC<Props> = ({
  status,
  size = 'default',
}) => {
  switch (status) {
    case undefined:
      return undefined;
    case AssessmentStatus.NotStarted:
      return (
        <Display
          icon={NotStartedIcon}
          color='disabled'
          caption='Not Started'
          size={size}
        />
      );
    case AssessmentStatus.Started:
      return (
        <Display
          icon={InProgressIcon}
          color='warning'
          caption='In Progress'
          size={size}
        />
      );
    case AssessmentStatus.Submitted:
      return (
        <Display
          icon={SubmittedIcon}
          color='success'
          caption='Submitted'
          size={size}
        />
      );
    case AssessmentStatus.Warning:
      return (
        <Display
          icon={ErrorOutlineIcon}
          color='warning'
          caption='Has Issues'
          size={size}
        />
      );
    case AssessmentStatus.Error:
      return (
        <Display
          icon={ErrorIcon}
          color='error'
          caption='Has Issues'
          size={size}
        />
      );
  }
};

export default AssessmentStatusIndicator;
