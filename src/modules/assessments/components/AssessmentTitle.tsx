import { Box, Typography } from '@mui/material';
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
      <Box sx={{ mb: 1 }}>
        <Typography variant='h4'>{clientName}</Typography>
        <Typography variant='h5'>
          <Box
            component='span'
            sx={({ typography, palette }) => ({
              fontWeight: typography.fontWeightBold,
              color: palette.grey[700],
            })}
          >
            {assessmentTitle}
            {': '}
          </Box>
          {projectName}
        </Typography>
      </Box>
    );
  }
  return (
    <Typography variant='h4' sx={{ mb: 1 }}>
      {assessmentTitle}
    </Typography>
  );
};

export default AssessmentTitle;
