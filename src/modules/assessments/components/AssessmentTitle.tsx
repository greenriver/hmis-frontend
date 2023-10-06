import { Alert, AlertTitle, Skeleton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useState } from 'react';
import { useRelatedAnnualAssessments } from '../hooks/useRelatedAnnualAssessments';
import RouterLink from '@/components/elements/RouterLink';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
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
}: AssessmentTitleProps) => {
  // const hhAssessments = useHouseholdAssessments(role, householdId, assessmentId)
  const isAnnual = assessmentRole == AssessmentRole.Annual;
  const { assessmentInfo, loading } = useRelatedAnnualAssessments({
    householdId: householdId || '',
    enrollmentId,
    assessmentId,
    skip:
      !isAnnual || householdSize === 1 || embeddedInWorkflow || !householdId,
  });
  const [alertHidden, setAlertHidden] = useState(false);

  let subtitle = null;
  if (assessmentInfo && assessmentInfo.length > 0 && !alertHidden) {
    subtitle = (
      <Alert
        severity='info'
        sx={{ my: 1 }}
        onClose={() => setAlertHidden(true)}
        icon={false}
      >
        <AlertTitle>Related annual assessments in this household:</AlertTitle>
        <Stack gap={0.5}>
          {assessmentInfo.map(
            ({ enrollmentId, clientName, firstName, assessmentDate, path }) => (
              <Stack direction={'row'} gap={1} key={enrollmentId}>
                <Typography variant='body2'>
                  {clientName}
                  {':'}
                </Typography>
                <RouterLink to={path} openInNew>
                  {assessmentDate
                    ? parseAndFormatDate(assessmentDate)
                    : 'Start new '}{' '}
                  Annual Assessment for {firstName}
                </RouterLink>
              </Stack>
            )
          )}
        </Stack>
      </Alert>
    );
  }

  if (!assessmentInfo && loading && !subtitle && !alertHidden) {
    subtitle = <Skeleton variant='rectangular' width='100%' height={50} />;
  }

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
      {subtitle}
    </Stack>
  );
};

export default AssessmentTitle;
