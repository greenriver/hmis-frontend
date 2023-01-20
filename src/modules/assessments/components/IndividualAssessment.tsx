import { Box, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import { HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT } from './HouseholdAssessments';
import MissingDefinitionAlert from './MissingDefinitionAlert';

import { useEnrollment } from '@/components/dashboard/enrollments/useEnrollment';
import { alertErrorFallback } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import AssessmentForm from '@/modules/assessments/components/AssessmentForm';
import { useAssessment } from '@/modules/assessments/components/useAssessment';
import { enrollmentName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole, EnrollmentFieldsFragment } from '@/types/gqlTypes';

interface Props {
  enrollmentId: string;
  assessmentId?: string;
  assessmentRole?: AssessmentRole;
  embeddedInWorkflow?: boolean;
  clientName?: string;
}

const assessmentPrefix = (role: AssessmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return 'Entry to';
    case AssessmentRole.Exit:
      return 'Exit from';
    default:
      return;
  }
};

const assessmentDate = (
  role?: AssessmentRole,
  enrollment?: EnrollmentFieldsFragment
) => {
  if (!enrollment || !role) return;
  switch (role) {
    case AssessmentRole.Intake:
      return enrollment.entryDate;
    case AssessmentRole.Exit:
      return enrollment.exitDate;
    default:
      return;
  }
};

/**
 * Renders a single assessment form for an individual, including form stepper nav.
 *
 * If assessmentId is provided, we're editing an existing assessment.
 * If assessmentRole is provided, we're creating a new assessment.
 */
const IndividualAssessment = ({
  enrollmentId,
  assessmentId,
  assessmentRole: assessmentRoleParam,
  embeddedInWorkflow = false,
  clientName,
}: Props) => {
  const { overrideBreadcrumbTitles } = useOutletContext<DashboardContext>();

  // Fetch the enrollment, which may be different from the current context enrollment if this assessment is part of a workflow.
  const { enrollment, loading: enrollmentLoading } =
    useEnrollment(enrollmentId);

  const {
    definition,
    assessment,
    loading: dataLoading,
    assessmentTitle,
    assessmentRole,
  } = useAssessment(enrollmentId, assessmentId, assessmentRoleParam);

  const informationDate = useMemo(
    () => assessmentDate(assessmentRole, enrollment),
    [enrollment, assessmentRole]
  );

  useEffect(() => {
    if (!assessmentTitle || embeddedInWorkflow) return;
    // Override breadcrumb to include the assessment type and information date
    const currentRoute = assessment
      ? DashboardRoutes.VIEW_ASSESSMENT
      : DashboardRoutes.NEW_ASSESSMENT;
    const breadCrumbTitle = `${assessmentTitle} ${
      informationDate ? `for ${parseAndFormatDate(informationDate)}` : ''
    }`;
    overrideBreadcrumbTitles({ [currentRoute]: breadCrumbTitle });
  }, [
    embeddedInWorkflow,
    assessmentTitle,
    informationDate,
    assessment,
    overrideBreadcrumbTitles,
  ]);

  const topOffsetHeight =
    STICKY_BAR_HEIGHT +
    CONTEXT_HEADER_HEIGHT +
    (embeddedInWorkflow ? HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT : 0);

  if (dataLoading || enrollmentLoading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <>
      {!embeddedInWorkflow && (
        <Stack direction='row'>
          <Typography variant='h4' sx={{ mt: 1, mb: 3, fontWeight: 400 }}>
            <b>{assessmentTitle}</b>
            {informationDate && ` ${parseAndFormatDate(informationDate)}`}
            {embeddedInWorkflow && clientName && ` for ${clientName}`}
          </Typography>
        </Stack>
      )}
      {!definition && (
        <MissingDefinitionAlert
          hasAssessmentDetail={!!assessment?.assessmentDetail}
        />
      )}
      {definition && (
        <AssessmentForm
          assessmentRole={assessmentRole}
          definition={definition}
          assessment={assessment}
          enrollment={enrollment}
          top={topOffsetHeight}
          navigationTitle={
            embeddedInWorkflow ? (
              <Stack sx={{ mb: 3 }} gap={1}>
                <Typography variant='h5'>{clientName}</Typography>
                {assessmentRole && assessmentPrefix(assessmentRole) && (
                  <Typography variant='body2'>
                    {assessmentPrefix(assessmentRole)}{' '}
                    {enrollmentName(enrollment)}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography variant='h6' sx={{ mb: 2 }}>
                Form Navigation
              </Typography>
            )
          }
        />
      )}
    </>
  );
};

const WrappedAssessment = (props: Props) => (
  <Box>
    <Sentry.ErrorBoundary fallback={alertErrorFallback}>
      <IndividualAssessment {...props} />
    </Sentry.ErrorBoundary>
  </Box>
);

export default WrappedAssessment;
