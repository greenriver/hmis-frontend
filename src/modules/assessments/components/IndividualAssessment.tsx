import { Box, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import MissingDefinitionAlert from './MissingDefinitionAlert';

import { useEnrollment } from '@/components/dashboard/enrollments/useEnrollment';
import { alertErrorFallback } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import AssessmentForm from '@/modules/assessments/components/AssessmentForm';
import { useAssessment } from '@/modules/assessments/components/useAssessment';
import { DynamicFormProps } from '@/modules/form/components/DynamicForm';
import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  EnrollmentFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

export interface IndividualAssessmentProps {
  enrollmentId: string;
  assessmentId?: string;
  assessmentRole?: AssessmentRole;
  embeddedInWorkflow?: boolean;
  clientName?: string;
  relationshipToHoH: RelationshipToHoH;
  client: ClientNameDobVeteranFields;
  lockIfSubmitted?: boolean;
  getFormActionProps?: (
    assessment?: AssessmentFieldsFragment
  ) => DynamicFormProps['FormActionProps'];
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
  client,
  relationshipToHoH,
  lockIfSubmitted,
  getFormActionProps,
}: IndividualAssessmentProps) => {
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
  } = useAssessment({
    enrollmentId,
    assessmentId,
    assessmentRoleParam,
    client,
    relationshipToHoH,
  });

  const informationDate = useMemo(
    () => assessmentDate(assessmentRole, enrollment),
    [enrollment, assessmentRole]
  );

  const FormActionProps = useMemo(
    () =>
      !dataLoading && getFormActionProps
        ? {
            lastSaved:
              assessment && assessment.inProgress
                ? assessment.dateUpdated
                : undefined,
            lastSubmitted:
              assessment && !assessment.inProgress
                ? assessment.dateUpdated
                : undefined,
            ...getFormActionProps(assessment),
          }
        : {},
    [getFormActionProps, dataLoading, assessment]
  );

  useEffect(() => {
    if (!assessmentTitle || embeddedInWorkflow) return;
    // Override breadcrumb to include the assessment type and information date
    const currentRoute = assessment
      ? DashboardRoutes.VIEW_ASSESSMENT
      : DashboardRoutes.NEW_ASSESSMENT;
    overrideBreadcrumbTitles({ [currentRoute]: assessmentTitle });
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
            {/* {informationDate && ` ${parseAndFormatDate(informationDate)}`} */}
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
          key={assessment?.id}
          assessmentRole={assessmentRole}
          definition={definition}
          assessment={assessment}
          enrollment={enrollment}
          top={topOffsetHeight}
          embeddedInWorkflow={embeddedInWorkflow}
          FormActionProps={FormActionProps}
          locked={lockIfSubmitted && assessment && !assessment.inProgress}
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

const WrappedAssessment = (props: IndividualAssessmentProps) => (
  <Box>
    <Sentry.ErrorBoundary fallback={alertErrorFallback}>
      <IndividualAssessment {...props} />
    </Sentry.ErrorBoundary>
  </Box>
);

export default WrappedAssessment;
