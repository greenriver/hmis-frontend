import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LockIcon from '@mui/icons-material/Lock';

import { AssessmentStatus } from './util';

import { FormRole } from '@/types/gqlTypes';

const TabIndicator = ({
  status,
}: {
  status: AssessmentStatus;
  role: FormRole.Intake | FormRole.Exit;
}) => {
  let Icon;
  let color:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'disabled'
    | undefined;

  // const text = labelForStatus(status, role);
  switch (status) {
    case AssessmentStatus.NotStarted:
      Icon = HighlightOffIcon;
      break;
    case AssessmentStatus.Started:
      Icon = CheckCircleOutlineIcon;
      // color = 'warning';
      break;
    case AssessmentStatus.ReadyToSubmit:
      Icon = CheckCircleOutlineIcon;
      color = 'success';
      break;
    case AssessmentStatus.Submitted:
      Icon = LockIcon;
      color = 'disabled';
      break;
    case AssessmentStatus.Warning:
      Icon = ErrorOutlineIcon;
      color = 'warning';
      break;
    case AssessmentStatus.Error:
      Icon = ErrorIcon;
      color = 'error';
      break;
  }

  return <Icon fontSize='medium' color={color || 'inherit'} />;
  // return (
  //   <Stack direction='row' alignItems='center' alignSelf='center' gap={0.8}>
  //     <Box component='span' sx={{ fontSize: 16, display: 'flex' }}>
  //       <Icon fontSize='inherit' color={color || 'inherit'} />
  //     </Box>
  //     <Typography
  //       variant='subtitle2'
  //       fontSize={'.8rem'}
  //       // color='text.primary'
  //       // color={(theme) =>
  //       //   color ? darken(theme.palette[color].main, 0.3) : 'text.primary'
  //       // }
  //       sx={{ fontWeight: 600 }}
  //     >
  //       {text}
  //     </Typography>
  //   </Stack>
  // );
};

export default TabIndicator;
