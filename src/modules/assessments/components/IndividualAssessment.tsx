import { Box, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import { assessmentDate, assessmentPrefix } from '../util';

import MissingDefinitionAlert from './MissingDefinitionAlert';

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
import { useEnrollment } from '@/modules/dataFetching/hooks/useEnrollment';
import { DynamicFormProps } from '@/modules/form/components/DynamicForm';
import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  FormRole,
  RelationshipToHoH,
} from '@/types/gqlTypes';

export interface IndividualAssessmentProps {
  enrollmentId: string;
  assessmentId?: string;
  formRole?: FormRole;
  embeddedInWorkflow?: boolean;
  clientName?: string;
  relationshipToHoH: RelationshipToHoH;
  client: ClientNameDobVeteranFields;
  lockIfSubmitted?: boolean;
  visible?: boolean;
  getFormActionProps?: (
    assessment?: AssessmentFieldsFragment
  ) => DynamicFormProps['FormActionProps'];
}

/**
 * Renders a single assessment form for an individual, including form stepper nav.
 *
 * If assessmentId is provided, we're editing an existing assessment.
 * If formRole is provided, we're creating a new assessment.
 */
const IndividualAssessment = ({
  enrollmentId,
  assessmentId,
  formRole: formRoleParam,
  embeddedInWorkflow = false,
  clientName,
  client,
  relationshipToHoH,
  lockIfSubmitted,
  getFormActionProps,
  visible,
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
    formRole,
  } = useAssessment({
    enrollmentId,
    assessmentId,
    formRoleParam,
    client,
    relationshipToHoH,
  });

  const informationDate = useMemo(
    () => assessmentDate(formRole, enrollment),
    [enrollment, formRole]
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
        <MissingDefinitionAlert hasCustomForm={!!assessment?.customForm} />
      )}
      {definition && (
        <AssessmentForm
          key={assessment?.id}
          formRole={formRole}
          definition={definition}
          assessment={assessment}
          enrollment={enrollment}
          top={topOffsetHeight}
          embeddedInWorkflow={embeddedInWorkflow}
          FormActionProps={FormActionProps}
          locked={lockIfSubmitted && assessment && !assessment.inProgress}
          visible={visible}
          navigationTitle={
            embeddedInWorkflow ? (
              <Stack sx={{ mb: 3 }} gap={1}>
                <Typography variant='h5'>{clientName}</Typography>
                {formRole && assessmentPrefix(formRole) && (
                  <Typography variant='body2'>
                    {assessmentPrefix(formRole)} {enrollmentName(enrollment)}
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
