import { Alert, AlertTitle, Skeleton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useState } from 'react';
import { useRelatedAnnualAssessments } from '../hooks/useRelatedAnnualAssessments';
import RouterLink from '@/components/elements/RouterLink';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AssessmentRole } from '@/types/gqlTypes';

export interface AssessmentTitleProps {
  assessmentRole: AssessmentRole;
  assessmentId?: string;
  enrollmentId: string;
  householdId: string;
  embeddedInWorkflow?: boolean;
  householdSize: number;
}

const AssessmentRelatedAnnualsAlert = ({
  householdId,
  enrollmentId,
  assessmentId,
  embeddedInWorkflow,
  assessmentRole,
  householdSize,
}: AssessmentTitleProps) => {
  const isAnnual = assessmentRole === AssessmentRole.Annual;
  const skipQuery = !isAnnual || householdSize === 1 || embeddedInWorkflow;
  const { assessmentInfo, loading } = useRelatedAnnualAssessments({
    householdId: householdId || '',
    enrollmentId,
    assessmentId,
    skip: skipQuery,
  });
  const [alertHidden, setAlertHidden] = useState(false);

  if (assessmentInfo && assessmentInfo.length > 0 && !alertHidden) {
    return (
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
                  {parseAndFormatDate(assessmentDate)} Annual Assessment for{' '}
                  {firstName}
                </RouterLink>
              </Stack>
            )
          )}
        </Stack>
      </Alert>
    );
  }

  if (!skipQuery && !assessmentInfo && loading && !alertHidden) {
    return <Skeleton variant='rectangular' width='100%' height={50} />;
  }
};

export default AssessmentRelatedAnnualsAlert;
