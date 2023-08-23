import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';
import { Stack, Typography } from '@mui/material';
import { AssessmentFieldsFragment } from '@/types/gqlTypes';

const AssessmentStatus = ({
  assessment,
}: {
  assessment: AssessmentFieldsFragment;
}) => {
  let Icon = LockIcon;
  let color: 'disabled' | 'error' | 'secondary' = 'disabled';
  let text = 'Submitted';
  let textColor = 'gray';
  if (assessment.inProgress) {
    Icon = ErrorOutlineIcon;
    color = 'error';
    text = 'Incomplete';
    textColor = color;
  }
  return (
    <Stack direction='row' alignItems='center' gap={0.8}>
      <Icon color={color} fontSize='small' />
      <Typography
        variant='body2'
        color={textColor}
        sx={{ textDecoration: 'none' }}
      >
        {text}
      </Typography>
    </Stack>
  );
};

export default AssessmentStatus;
