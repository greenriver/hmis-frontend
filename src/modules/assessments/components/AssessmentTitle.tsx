import { Alert, AlertTitle, Skeleton, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useState } from 'react';
import { useRelatedAnnualAssessments } from '../hooks/useRelatedAnnualAssessments';
import RouterLink from '@/components/elements/RouterLink';
import {
  parseAndFormatDate,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export interface AssessmentTitleProps {
  projectName: string;
  assessmentTitle?: ReactNode;
  assessmentRole: AssessmentRole;
  clientName: ReactNode;
  clientId: string;
  assessmentId?: string;
  enrollmentId: string;
  entryDate: string;
  exitDate?: string | null;
  householdId: string;
  embeddedInWorkflow?: boolean;
  householdSize: number;
}

const AssessmentTitle = ({
  projectName,
  assessmentTitle,
  clientName,
  clientId,
  householdId,
  enrollmentId,
  entryDate,
  exitDate,
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

  if (!skipQuery && !assessmentInfo && loading && !subtitle && !alertHidden) {
    subtitle = <Skeleton variant='rectangular' width='100%' height={50} />;
  }

  return (
    <Stack sx={{ mb: 1 }} gap={1}>
      <Typography variant='h4'>{clientName}</Typography>
      <Typography variant='body1' component='div'>
        <b>
          {assessmentTitle}
          {': '}
        </b>
        <RouterLink
          to={generateSafePath(Routes.ENROLLMENT_DASHBOARD, {
            enrollmentId,
            clientId,
          })}
          openInNew
        >
          {projectName} ({parseAndFormatDateRange(entryDate, exitDate)})
        </RouterLink>
      </Typography>
      {subtitle}
    </Stack>
  );
};

export default AssessmentTitle;
