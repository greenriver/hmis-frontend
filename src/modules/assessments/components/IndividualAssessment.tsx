import { Box, Typography } from '@mui/material';
import { Ref, useEffect, useMemo } from 'react';

import { assessmentDate } from '../util';

import AssessmentTitle from './AssessmentTitle';
import MissingDefinitionAlert from './MissingDefinitionAlert';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssessmentForm from '@/modules/assessments/components/AssessmentForm';
import AssessmentStatusIndicator from '@/modules/assessments/components/AssessmentStatusIndicator';
import { AssessmentStatus } from '@/modules/assessments/components/household/util';
import { useAssessment } from '@/modules/assessments/hooks/useAssessment';
import { useBasicEnrollment } from '@/modules/enrollment/hooks/useBasicEnrollment';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
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
  assessmentStatus?: AssessmentStatus;
  visible?: boolean;
  getFormActionProps?: (
    assessment?: AssessmentFieldsFragment
  ) => DynamicFormProps['FormActionProps'];
  formRef?: Ref<DynamicFormRef>;
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
  assessmentStatus,
  formRole: formRoleParam,
  embeddedInWorkflow = false,
  clientName,
  client,
  relationshipToHoH,
  getFormActionProps,
  visible,
  formRef,
}: IndividualAssessmentProps) => {
  const { overrideBreadcrumbTitles } = useClientDashboardContext();

  // Fetch the enrollment, which may be different from the current context enrollment if this assessment is part of a workflow.
  const { enrollment, loading: enrollmentLoading } =
    useBasicEnrollment(enrollmentId);

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
    overrideBreadcrumbTitles({
      [EnrollmentDashboardRoutes.ASSESSMENT]: assessmentTitle,
    });
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

  useScrollToHash(dataLoading || enrollmentLoading, topOffsetHeight);

  if (dataLoading || enrollmentLoading) return <Loading />;
  if (!enrollment) return <NotFound />;
  if (assessmentId && !assessment) return <NotFound />;
  if (!definition) return <MissingDefinitionAlert />;

  const title = (
    <AssessmentTitle
      assessmentTitle={assessmentTitle}
      clientName={clientName || undefined}
      projectName={enrollment.project.projectName}
    />
  );

  const navigationTitle = (
    <Box>
      <Typography
        variant='h5'
        sx={({ typography }) => ({
          mb: 1,
          fontWeight: typography.fontWeightBold,
        })}
      >
        {clientName}
      </Typography>
      <Typography variant='h6' component='div'>
        <Box
          component='span'
          sx={({ typography }) => ({ fontWeight: typography.fontWeightBold })}
        >
          {`${definition.title}: `}
        </Box>
        {enrollment.project.projectName}
        {assessmentStatus && (
          <AssessmentStatusIndicator status={assessmentStatus} />
        )}
      </Typography>
    </Box>
  );

  // const navigationTitle=<> </>
  return (
    <AssessmentForm
      assessmentTitle={title}
      navigationTitle={navigationTitle}
      key={assessment?.id}
      formRole={formRole}
      definition={definition}
      assessment={assessment}
      enrollment={enrollment}
      top={topOffsetHeight}
      embeddedInWorkflow={embeddedInWorkflow}
      FormActionProps={FormActionProps}
      visible={visible}
      formRef={formRef}
    />
  );
};

const WrappedAssessment = (props: IndividualAssessmentProps) => (
  <Box sx={{ mt: 3 }}>
    <SentryErrorBoundary>
      <IndividualAssessment {...props} />
    </SentryErrorBoundary>
  </Box>
);

export default WrappedAssessment;
