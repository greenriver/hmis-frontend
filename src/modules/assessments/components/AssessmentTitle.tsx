import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Routes } from '@/app/routes';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import RouterLink from '@/components/elements/RouterLink';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
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
    <>
      <Typography variant='h4'>{clientName}</Typography>

      <CommonLabeledTextBlock
        title={assessmentTitle + ':'}
        horizontal
        variant='body1'
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
    </>
  );
};

export default AssessmentTitle;
