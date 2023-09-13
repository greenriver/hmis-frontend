import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode } from 'react';

export interface AssessmentTitleProps {
  projectName: string;
  assessmentTitle?: ReactNode;
  clientName?: ReactNode;
}

const AssessmentTitle = ({
  projectName,
  assessmentTitle,
  clientName,
}: AssessmentTitleProps) => {
  if (clientName) {
    return (
      <Stack sx={{ mb: 1 }} gap={1}>
        <Typography variant='h4'>{clientName}</Typography>
        <Typography variant='body1'>
          <b>
            {assessmentTitle}
            {': '}
          </b>
          {projectName}
        </Typography>
      </Stack>
    );
  }
  return (
    <Typography variant='h4' sx={{ mb: 1 }}>
      {assessmentTitle}
    </Typography>
  );
};

export default AssessmentTitle;
