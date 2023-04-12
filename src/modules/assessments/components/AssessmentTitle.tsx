import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface AssessmentTitleProps {
  assessmentTitle?: ReactNode;
  clientName?: ReactNode;
  actions?: ReactNode;
}

const AssessmentTitle = ({
  assessmentTitle,
  clientName,
  actions,
}: AssessmentTitleProps) => {
  return (
    <Stack direction='row' justifyContent='space-between'>
      <Typography variant='h4' sx={{ mt: 1, mb: 3, fontWeight: 400 }}>
        <b>{assessmentTitle}</b>
        {clientName && ` for ${clientName}`}
      </Typography>
      <Box>{actions}</Box>
    </Stack>
  );
};

export default AssessmentTitle;
