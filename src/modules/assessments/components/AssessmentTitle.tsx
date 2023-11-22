import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode } from 'react';
import { useRelatedAnnualAssessments } from '../hooks/useRelatedAnnualAssessments';
import { AssessmentRole } from '@/types/gqlTypes';

export interface AssessmentTitleProps {
  projectName: string;
  assessmentTitle?: ReactNode;
  assessmentRole: AssessmentRole;
  clientName: ReactNode;
  assessmentId?: string;
  enrollmentId: string;
  householdId: string;
  embeddedInWorkflow?: boolean;
  householdSize: number;
  assessmentDate?: Date;
}

const AssessmentTitle = ({
  projectName,
  assessmentTitle,
  clientName,
  householdId,
  enrollmentId,
  assessmentId,
  embeddedInWorkflow,
  assessmentRole,
  householdSize,
  assessmentDate,
}: AssessmentTitleProps) => {
  // const hhAssessments = useHouseholdAssessments(role, householdId, assessmentId)
  const isAnnual = assessmentRole == AssessmentRole.Annual;
  const skipQuery = !isAnnual || householdSize === 1 || embeddedInWorkflow;

  const { renderAnnualAlert } = useRelatedAnnualAssessments({
    householdId: householdId || '',
    enrollmentId,
    assessmentId,
    assessmentDate,
    skip: skipQuery,
  });

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
      {renderAnnualAlert()}
    </Stack>
  );
};

export default AssessmentTitle;
