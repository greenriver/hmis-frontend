import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import RouterLink from '@/components/elements/RouterLink';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

export interface AssessmentTitleProps {
  projectName: string;
  assessmentTitle?: ReactNode;
  clientName: ReactNode;
  clientId: string;
  enrollmentId: string;
  entryDate: string;
  exitDate?: string | null;
}

const AssessmentTitle = ({
  projectName,
  assessmentTitle,
  clientName,
  clientId,
  enrollmentId,
  entryDate,
  exitDate,
}: AssessmentTitleProps) => {
  return (
    <Stack gap={1} component='h1' sx={{ m: 0 }}>
      <Typography variant='h4' component='span'>
        {clientName}
      </Typography>

      <CommonLabeledTextBlock
        title={assessmentTitle + ':'}
        horizontal
        variant='body1'
        component='span'
      >
        <RouterLink
          to={generateSafePath(Routes.ENROLLMENT_DASHBOARD, {
            enrollmentId,
            clientId,
          })}
          openInNew
        >
          {projectName} ({parseAndFormatDateRange(entryDate, exitDate)})
        </RouterLink>
      </CommonLabeledTextBlock>
    </Stack>
  );
};

export default AssessmentTitle;
